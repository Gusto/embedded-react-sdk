import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useEarningTypesListSuspense } from '@gusto/embedded-api/react-query/earningTypesList'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import {
  buildPayrollUpdateEmployeeCompensation,
  collectOvertimeEarningNames,
  createPayrollEditEmployeeSchema,
  derivePayrollEditEmployeeDefaults,
  normalizeWorkweeks,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_VALUES,
  type PayrollEditEmployeeFormData,
  type PayrollEditEmployeeFormOutputs,
} from './payrollEditEmployeeSchema'
import { createPayrollEditEmployeeFields, type PayrollEditEmployeeFields } from './fields'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { derivePayrollCategory } from '@/components/Payroll/payrollTypes'
import { isOvertimeEligibleFlsaStatus } from '@/components/Payroll/helpers'
import { retryAsync } from '@/helpers/retryAsync'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import {
  composeErrorHandler,
  type QueryWithRefetch,
} from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldMetadataWithOptions,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

const PREPARE_MAX_ATTEMPTS = 4
const PREPARE_RETRY_DELAY_MS = 1500

const isPayrollBeingProcessedError = (error: unknown): boolean =>
  error instanceof UnprocessableEntityError &&
  error.errors.some(issue => issue.category === 'invalid_operation')

/**
 * Options accepted by {@link usePayrollEditEmployeeForm}.
 *
 * @public
 */
export interface UsePayrollEditEmployeeFormProps {
  /** The associated employee identifier. */
  employeeId: string
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /** Whether reimbursement fields participate in the form. Defaults to `true`. */
  withReimbursements?: boolean
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`. Set to `false` when composing with other forms. */
  shouldFocusError?: boolean
}

/**
 * Field metadata for {@link usePayrollEditEmployeeForm}, keyed by full form path.
 *
 * @remarks
 * Keys are minted from the prepared payroll's compensations at runtime
 * (`hours.${jobUuid}.${name}.${workweekStart}` and similar), so neither the key
 * set nor which entries carry options is known ahead of time.
 *
 * @public
 */
export type PayrollEditEmployeeFieldsMetadata = Record<
  string,
  FieldMetadata | FieldMetadataWithOptions
>

/**
 * Ready-state return value of {@link usePayrollEditEmployeeForm} — the
 * `isLoading: false` branch of {@link UsePayrollEditEmployeeFormResult}.
 *
 * @public
 */
export interface UsePayrollEditEmployeeFormReady
  extends BaseFormHookReady<
    PayrollEditEmployeeFieldsMetadata,
    PayrollEditEmployeeFormData,
    PayrollEditEmployeeFields
  > {
  /** Loaded entities backing the editor. */
  data: {
    /** The employee being edited. */
    employee: Employee
    /** The employee's prepared compensation for this payroll, if present. */
    employeeCompensation?: PayrollEmployeeCompensationsType
    /** The prepared payroll (server-calculated totals and workweeks). */
    preparedPayroll: PayrollPrepared
    /** The pay schedule for the payroll, if loaded. */
    paySchedule?: PayScheduleShow
    /** Whether the pay period spans more than one workweek. Raw workweeks are on `preparedPayroll.workweeks`. */
    isMultipleWorkweeks: boolean
    /** Whether the employee is overtime-eligible (nonexempt family). Drives whether hours split by workweek. */
    isOvertimeEligible: boolean
    /** Whether the employee has a direct-deposit bank account set up. */
    hasDirectDepositSetup: boolean
  }
  /** Submission status. `mode` is always `'update'` since the payroll already exists. */
  status: { isPending: boolean; mode: 'update' }
  /** Form actions. */
  actions: {
    /** Validates and submits the form, resolving to the updated prepared payroll on success or `undefined` when validation blocked the submit. */
    onSubmit: () => Promise<HookSubmitResult<PayrollPrepared> | undefined>
  }
}

/**
 * Discriminated union returned by {@link usePayrollEditEmployeeForm}. Loading
 * branch carries only `errorHandling`; ready branch carries form data, fields,
 * status, and actions.
 *
 * @public
 */
export type UsePayrollEditEmployeeFormResult = HookLoadingResult | UsePayrollEditEmployeeFormReady

/**
 * Headless form hook for editing a single employee's compensation within a
 * payroll run, built for regular-rate-of-pay (RRoP) support.
 *
 * @remarks
 * Prepares the payroll for the target employee, then exposes a workweek-keyed
 * form whose submit builds a `PayrollUpdate`. Single-workweek pay periods send
 * totals without `breakdowns`; multi-workweek pay periods send `breakdowns`
 * tiling every workweek exactly. This is the PR-1 infrastructure slice: the
 * field builders return empty collections and the visible sections land in later
 * PRs, while the schema, defaults, submit payload, and error handling are wired.
 *
 * @param props - Hook options.
 * @returns A loading result while data is fetching, or a ready result with data,
 * fields, status, actions, and error handling.
 * @public
 */
export function usePayrollEditEmployeeForm({
  employeeId,
  companyId,
  payrollId,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UsePayrollEditEmployeeFormProps): UsePayrollEditEmployeeFormResult {
  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const { data: earningTypesData } = useEarningTypesListSuspense({ companyId })

  const { mutateAsync: preparePayroll } = usePayrollsPrepareMutation()
  const { mutateAsync: updatePayroll, isPending } = usePayrollsUpdateMutation()

  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()
  const [prepareError, setPrepareError] = useState<Error | null>(null)
  const hasFiredRef = useRef(false)

  const executePrepare = useCallback(async () => {
    setPrepareError(null)
    try {
      const result = await retryAsync(
        () =>
          preparePayroll({
            request: { companyId, payrollId, requestBody: { employeeUuids: [employeeId] } },
          }),
        {
          maxAttempts: PREPARE_MAX_ATTEMPTS,
          delayMs: PREPARE_RETRY_DELAY_MS,
          shouldRetry: isPayrollBeingProcessedError,
        },
      )
      setPreparedPayroll(result.payrollPrepared)
    } catch (error) {
      setPrepareError(error as Error)
    }
  }, [companyId, payrollId, employeeId, preparePayroll])

  useEffect(() => {
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    void executePrepare()
  }, [executePrepare])

  const payScheduleQuery = usePaySchedulesGet(
    { companyId, payScheduleId: preparedPayroll?.payPeriod?.payScheduleUuid ?? '' },
    { enabled: !!preparedPayroll?.payPeriod?.payScheduleUuid },
  )

  const employee = employeeData.employee
  const employeeCompensation = preparedPayroll?.employeeCompensations?.at(0)
  const payrollCategory = derivePayrollCategory(preparedPayroll ?? {})
  const hasDirectDepositSetup = (bankAccountsList.employeeBankAccounts?.length ?? 0) > 0

  const workweeks = useMemo(
    () => normalizeWorkweeks(preparedPayroll?.workweeks, preparedPayroll?.payPeriod),
    [preparedPayroll?.workweeks, preparedPayroll?.payPeriod],
  )

  const overtimeEarningNames = useMemo(
    () => collectOvertimeEarningNames(earningTypesData.earningTypeList),
    [earningTypesData.earningTypeList],
  )

  // Source of truth for the employee's FLSA status: prefer the prepared
  // compensation's hourly lines (the same data the fields are built from, so the
  // gate and the rendered lines always agree), falling back to the employee's
  // primary-job compensation. Unknown status is treated as not overtime-eligible.
  const flsaStatus = useMemo(() => {
    const fromCompensation = employeeCompensation?.hourlyCompensations?.find(
      compensation => compensation.flsaStatus,
    )?.flsaStatus
    if (fromCompensation) return fromCompensation
    const primaryJob = employee?.jobs?.find(job => job.primary)
    return primaryJob?.compensations?.[0]?.flsaStatus
  }, [employeeCompensation, employee])
  const isOvertimeEligible = isOvertimeEligibleFlsaStatus(flsaStatus)

  const jobTitlesByUuid = useMemo(() => {
    const titles = new Map<string, string>()
    for (const job of employee?.jobs ?? []) {
      if (job.uuid && job.title) titles.set(job.uuid, job.title)
    }
    return titles
  }, [employee])

  const schema = useMemo(() => createPayrollEditEmployeeSchema(), [])

  const resolvedDefaults = useMemo(
    () =>
      derivePayrollEditEmployeeDefaults(
        employeeCompensation,
        workweeks,
        hasDirectDepositSetup,
        overtimeEarningNames,
        isOvertimeEligible,
      ),
    [employeeCompensation, workweeks, hasDirectDepositSetup, overtimeEarningNames, isOvertimeEligible],
  )

  const formMethods = useForm<PayrollEditEmployeeFormData, unknown, PayrollEditEmployeeFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const fields = useMemo(
    () =>
      createPayrollEditEmployeeFields({
        employeeCompensation,
        workweeks,
        payrollCategory,
        hasDirectDepositSetup,
        overtimeEarningNames,
        isOvertimeEligible,
        jobTitlesByUuid,
      }),
    [
      employeeCompensation,
      workweeks,
      payrollCategory,
      hasDirectDepositSetup,
      overtimeEarningNames,
      isOvertimeEligible,
      jobTitlesByUuid,
    ],
  )
  const fieldsMetadata = useMemo<PayrollEditEmployeeFieldsMetadata>(
    () => ({
      paymentMethod: withOptions(
        { name: 'paymentMethod' },
        PAYMENT_METHOD_OPTIONS,
        PAYMENT_METHOD_VALUES,
      ),
    }),
    [],
  )

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PayrollEditEmployeeForm')

  const prepareQuerySource: QueryWithRefetch = {
    error: prepareError,
    refetch: (() => executePrepare()) as unknown as QueryWithRefetch['refetch'],
  }

  const errorHandling = composeErrorHandler([prepareQuerySource, payScheduleQuery], {
    submitError,
    setSubmitError,
  })

  const hookFormInternals = useHookFormInternals(formMethods)

  const onSubmit = async (): Promise<HookSubmitResult<PayrollPrepared> | undefined> => {
    let submitResult: HookSubmitResult<PayrollPrepared> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async data => {
          await baseSubmitHandler(data, async payload => {
            const compensation = buildPayrollUpdateEmployeeCompensation(
              payload,
              employeeCompensation,
              workweeks,
              payrollCategory,
              isOvertimeEligible,
            )

            const response = await updatePayroll({
              request: {
                companyId,
                payrollId,
                payrollUpdate: { employeeCompensations: [compensation] },
              },
            })

            const updated = response.payrollPrepared
            if (!updated) {
              throw new SDKInternalError('Payroll update did not return a prepared payroll')
            }

            setPreparedPayroll(updated)
            submitResult = { mode: 'update', data: updated }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  if (!preparedPayroll || !employee) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      employee,
      employeeCompensation,
      preparedPayroll,
      paySchedule: payScheduleQuery.data?.payScheduleShow,
      isMultipleWorkweeks: workweeks.length > 1,
      isOvertimeEligible,
      hasDirectDepositSetup,
    },
    status: { isPending, mode: 'update' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: fields,
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}
