import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
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
  createPayrollEditEmployeeSchema,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_VALUES,
  PayrollEditEmployeeErrorCodes,
  reimbursementDraftSchema,
  type PayrollEditEmployeeFormData,
  type PayrollEditEmployeeFormOutputs,
} from './payrollEditEmployeeSchema'
import {
  buildPayrollUpdateEmployeeCompensation,
  collectOvertimeEarningNames,
  derivePayrollEditEmployeeDefaults,
  hasBreakdownsMatchingWorkweeks,
  hasExistingOvertimeHours,
  normalizeWorkweeks,
  resolveEditableFixedCompensations,
  type NormalizedWorkweek,
} from './payrollEditEmployeeHelpers'
import {
  computeTimeOffRemaining,
  createPayrollEditEmployeeFields,
  createReimbursementDraftFields,
  type PayrollEditEmployeeErrorMessages,
  type PayrollEditEmployeeFields,
  type ReimbursementDraftFields,
  type ReimbursementRow,
} from './fields'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { derivePayrollCategory, isOffCyclePayroll } from '@/components/Payroll/payrollTypes'
import { PREPARE_QUERY_KEY } from '@/components/Payroll/PayrollConfiguration/usePayrollConfigurationData'
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
  /**
   * Whether to expose reimbursement controls (`form.Fields.reimbursements`,
   * `actions.addReimbursement`/`removeReimbursement`, `form.reimbursements`).
   * Defaults to `true`. Controls are omitted for off-cycle payrolls regardless,
   * since those write reimbursements via the legacy fixed-compensation path.
   */
  withReimbursements?: boolean
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`. Set to `false` when composing with other forms. */
  shouldFocusError?: boolean
  /**
   * Display copy for each validation error code, baked into every bound field so
   * it resolves and renders its own message. Supply it once, keyed by
   * {@link PayrollEditEmployeeErrorCodes}; a missing code falls back to the raw
   * code. Omit it to render raw codes.
   */
  errorMessages?: PayrollEditEmployeeErrorMessages
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
export interface UsePayrollEditEmployeeFormReady extends BaseFormHookReady<
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
    /** The employee's server-calculated gross pay for this payroll (excluding reimbursements), as a number. `0` when absent. */
    grossPay: number
    /** The pay schedule for the payroll, if loaded. */
    paySchedule?: PayScheduleShow
    /** Whether the pay period spans more than one workweek. Raw workweeks are on `preparedPayroll.workweeks`. */
    isMultipleWorkweeks: boolean
    /**
     * The pay period's normalized workweeks (`{ startDate, endDate }` strings),
     * in order — one entry, spanning the pay period, when it's a single
     * workweek. The per-workweek split fields are keyed by start date only, so
     * this is the source for each column's date range.
     */
    workweeks: NormalizedWorkweek[]
    /** Whether the employee is overtime-eligible (nonexempt family). Drives whether hours split by workweek. */
    isOvertimeEligible: boolean
    /**
     * The single, form-wide overtime-mode flag. `false` renders one flat
     * column per line with Overtime/Double-overtime rows hidden; `true`
     * splits hours and overtime-affecting earnings into per-workweek columns
     * (for overtime-eligible employees on a multi-workweek payroll) and
     * un-hides those rows. Starts `true` when the employee already has real
     * overtime hours or matching per-workweek breakdowns (see
     * `hasExistingOvertimeHours`, `hasBreakdownsMatchingWorkweeks`), or after
     * `actions.addOvertime` is called; otherwise starts `false`.
     */
    withOvertime: boolean
    /** Whether the employee has a direct-deposit bank account set up. */
    hasDirectDepositSetup: boolean
    /**
     * Committed reimbursement rows to render in a table, present only when
     * reimbursement controls are exposed. Seeded from the employee's existing
     * reimbursements and appended to as drafts are saved. Remove a row via
     * `actions.removeReimbursement(row.index)`.
     */
    reimbursements?: ReimbursementRow[]
  }
  /** Submission status. `mode` is always `'update'` since the payroll already exists. */
  status: { isPending: boolean; mode: 'update' }
  /** Form actions. */
  actions: {
    /** Validates and submits the form, resolving to the updated prepared payroll on success or `undefined` when validation blocked the submit. */
    onSubmit: () => Promise<HookSubmitResult<PayrollPrepared> | undefined>
    /**
     * Sets `data.withOvertime` to `true`, switching the whole form to the
     * workweek split: un-hides Overtime/Double-overtime rows and splits hours
     * and overtime-affecting earnings into per-workweek columns. Populates
     * only the first workweek cell of each line with that line's current
     * total, leaving every other cell blank — no auto distribution — so the
     * per-row validation then requires the user to fill in the rest. One
     * affordance for the whole employee, not one per job. One-directional —
     * there's no corresponding "remove overtime" action.
     */
    addOvertime: () => void
    /** Reveals the draft reimbursement row. Present only when reimbursement controls are exposed. */
    beginAddReimbursement?: () => void
    /** Validates the draft and commits it to the reimbursement list, or flags the draft amount if invalid. Present only when reimbursement controls are exposed. */
    saveReimbursement?: () => void
    /** Discards the draft reimbursement row. Present only when reimbursement controls are exposed. */
    cancelReimbursement?: () => void
    /** Removes the committed reimbursement row at `index` (zeroing existing rows so the update clears them). Present only when reimbursement controls are exposed. */
    removeReimbursement?: (index: number) => void
  }
  /** Form internals plus the reimbursement draft state. */
  form: BaseFormHookReady<
    PayrollEditEmployeeFieldsMetadata,
    PayrollEditEmployeeFormData,
    PayrollEditEmployeeFields
  >['form'] & {
    /** Draft reimbursement state, present only when reimbursement controls are exposed. */
    reimbursementDraft?: { isAdding: boolean }
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
 * totals without `breakdowns`; multi-workweek pay periods send `breakdowns` per
 * line once that line's every workweek cell is filled. Overtime-eligible
 * (nonexempt) employees split hours and overtime-affecting earnings per
 * workweek while the single `data.withOvertime` flag is on (see
 * `actions.addOvertime`); everyone else, and every line while `withOvertime` is
 * off, edits flat totals.
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
  withReimbursements = true,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  errorMessages,
}: UsePayrollEditEmployeeFormProps): UsePayrollEditEmployeeFormResult {
  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const { data: earningTypesData } = useEarningTypesListSuspense({ companyId })

  const queryClient = useQueryClient()
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

  // Only normalize once the payroll is prepared: normalizeWorkweeks throws on a
  // payroll with neither workweeks nor a pay period, and before prepare resolves
  // both are legitimately absent (still loading, not malformed).
  const workweeks = useMemo(
    () =>
      preparedPayroll
        ? normalizeWorkweeks(preparedPayroll.workweeks, preparedPayroll.payPeriod)
        : [],
    [preparedPayroll],
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

  // Starts on when the employee already has real overtime hours, or already has
  // per-workweek breakdowns matching the current pay period's workweeks (nothing
  // to hide either way), otherwise starts off until the user opts in via
  // `actions.addOvertime`. One-directional: there's no "remove overtime" action.
  const [withOvertimeSetByUser, setWithOvertimeSetByUser] = useState(false)
  const withOvertime =
    withOvertimeSetByUser ||
    hasExistingOvertimeHours(employeeCompensation?.hourlyCompensations) ||
    hasBreakdownsMatchingWorkweeks(employeeCompensation?.hourlyCompensations, workweeks)

  const primaryJobUuid = useMemo(() => employee?.jobs?.find(job => job.primary)?.uuid, [employee])

  // Seed a blank input for every payroll fixed-compensation type (like the stable
  // editor), then let the field/defaults builders split them into additional
  // earnings vs `other` by overtime inclusion. Without this, an employee whose
  // prepared payroll carries no fixed compensations shows no earnings inputs.
  const resolvedFixedCompensations = useMemo(
    () =>
      resolveEditableFixedCompensations(
        employeeCompensation?.fixedCompensations,
        preparedPayroll?.fixedCompensationTypes,
        primaryJobUuid,
        flsaStatus,
      ),
    [employeeCompensation, preparedPayroll?.fixedCompensationTypes, primaryJobUuid, flsaStatus],
  )

  const jobTitlesByUuid = useMemo(() => {
    const titles = new Map<string, string>()
    for (const job of employee?.jobs ?? []) {
      if (job.uuid && job.title) titles.set(job.uuid, job.title)
    }
    return titles
  }, [employee])

  // Accrual balance per time-off policy, owned by the hook (rather than looked
  // up in the consumer) so the time-off field can render its own live remaining
  // balance.
  const timeOffAccrualByName = useMemo(() => {
    const balances = new Map<string, string>()
    for (const policy of employee?.eligiblePaidTimeOff ?? []) {
      if (policy.name && policy.accrualBalance != null) {
        balances.set(policy.name, policy.accrualBalance)
      }
    }
    return balances
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
        withOvertime,
        resolvedFixedCompensations,
      ),
    [
      employeeCompensation,
      workweeks,
      hasDirectDepositSetup,
      overtimeEarningNames,
      isOvertimeEligible,
      withOvertime,
      resolvedFixedCompensations,
    ],
  )

  const formMethods = useForm<PayrollEditEmployeeFormData, unknown, PayrollEditEmployeeFormOutputs>(
    {
      resolver: zodResolver(schema),
      mode: validationMode,
      shouldFocusError,
      defaultValues: resolvedDefaults,
      values: resolvedDefaults,
      resetOptions: { keepDirtyValues: true },
    },
  )

  // Watched so each `Fields.timeOff[i].remaining` stays live as the user edits
  // hours. The whole form re-renders on keystroke regardless of who owns this
  // watch, so there's no cost to owning it here rather than in a per-row
  // subcomponent.
  const watchedTimeOff = useWatch({ control: formMethods.control, name: 'timeOff' })

  // Off-cycle payrolls write reimbursements via the legacy fixed-compensation path
  // (the itemized array is rejected server-side), so itemized reimbursement controls
  // are exposed only for regular payrolls and only when the partner opts in.
  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)
  const showReimbursements = withReimbursements && usesItemizedReimbursements

  const {
    fields: reimbursementArrayFields,
    append: appendReimbursement,
    remove: removeReimbursementRow,
    update: updateReimbursementRow,
  } = useFieldArray({
    control: formMethods.control,
    name: 'reimbursements',
  })

  const [isAddingReimbursement, setIsAddingReimbursement] = useState(false)

  const reimbursementDraftFields = useMemo<ReimbursementDraftFields>(
    () => createReimbursementDraftFields(errorMessages),
    [errorMessages],
  )

  // Committed rows for the consumer's table. A removed existing row (one with a
  // uuid) is zeroed rather than dropped so the update still clears it server-side;
  // those zero-amount rows are filtered out of the visible list but remain in the
  // form array for submit.
  const reimbursementRows = useMemo<ReimbursementRow[]>(
    () =>
      reimbursementArrayFields
        .map((field, index) => ({
          key: field.id,
          index,
          uuid: field.uuid ?? undefined,
          description: field.description,
          amount: field.amount,
          recurring: field.recurring ?? false,
        }))
        .filter(row => parseFloat(row.amount || '0') !== 0),
    [reimbursementArrayFields],
  )

  const beginAddReimbursement = useCallback(() => {
    setIsAddingReimbursement(true)
  }, [])

  const cancelReimbursement = useCallback(() => {
    formMethods.setValue('reimbursementDraft', { description: '', amount: '' })
    formMethods.clearErrors('reimbursementDraft')
    setIsAddingReimbursement(false)
  }, [formMethods])

  const saveReimbursement = useCallback(() => {
    const draft = formMethods.getValues('reimbursementDraft')
    const result = reimbursementDraftSchema.safeParse(draft)
    if (!result.success) {
      // The error code is a fallback; the field renders the consumer-supplied
      // `errorMessage` prop when present (see useField), so the copy is theirs to set.
      formMethods.setError('reimbursementDraft.amount', {
        message: PayrollEditEmployeeErrorCodes.REIMBURSEMENT_AMOUNT,
      })
      return
    }
    appendReimbursement({
      uuid: null,
      description: result.data.description.trim(),
      amount: parseFloat(result.data.amount).toFixed(2),
      recurring: false,
    })
    formMethods.setValue('reimbursementDraft', { description: '', amount: '' })
    formMethods.clearErrors('reimbursementDraft')
    setIsAddingReimbursement(false)
  }, [appendReimbursement, formMethods])

  const removeReimbursement = useCallback(
    (index: number) => {
      const field = reimbursementArrayFields[index]
      if (!field) return
      if (field.uuid) {
        updateReimbursementRow(index, { ...field, amount: '0' })
      } else {
        removeReimbursementRow(index)
      }
    },
    [reimbursementArrayFields, removeReimbursementRow, updateReimbursementRow],
  )

  const fields = useMemo(
    () =>
      createPayrollEditEmployeeFields({
        employeeCompensation,
        fixedCompensations: resolvedFixedCompensations,
        workweeks,
        payrollCategory,
        hasDirectDepositSetup,
        overtimeEarningNames,
        isOvertimeEligible,
        withOvertime,
        jobTitlesByUuid,
        timeOffAccrualByName,
        errorMessages,
      }),
    [
      employeeCompensation,
      resolvedFixedCompensations,
      workweeks,
      payrollCategory,
      hasDirectDepositSetup,
      overtimeEarningNames,
      isOvertimeEligible,
      withOvertime,
      jobTitlesByUuid,
      timeOffAccrualByName,
      errorMessages,
    ],
  )

  // Overlay the live remaining balance onto each time-off entry every render, so
  // it tracks the watched entered values without rebuilding (and remounting) the
  // bound field components the `fields` memo owns.
  const timeOffFields = useMemo(
    () =>
      fields.timeOff.map(entry => ({
        ...entry,
        remaining: computeTimeOffRemaining(
          timeOffAccrualByName.get(entry.name),
          watchedTimeOff[entry.name],
        ),
      })),
    [fields.timeOff, timeOffAccrualByName, watchedTimeOff],
  )

  // Re-derives with `withOvertime` forced `true` and pushes the result straight
  // into the form: every line's first workweek cell gets that line's current
  // total, every other cell is left blank (never auto-distributed — see
  // `derivePayrollEditEmployeeDefaults`/`buildWeekMap`). The per-row validation
  // then requires the user to fill in the rest before they can submit.
  // `setValue` (not `resetField`) is used so this overwrites even a value the
  // user already typed into the collapsed input. Plain function (not memoized):
  // it only runs on a user click, and its inputs are recomputed each render, so
  // a `useCallback` here would never actually hold a stable reference.
  const addOvertime = () => {
    setWithOvertimeSetByUser(true)
    const revealedDefaults = derivePayrollEditEmployeeDefaults(
      employeeCompensation,
      workweeks,
      hasDirectDepositSetup,
      overtimeEarningNames,
      isOvertimeEligible,
      true,
      resolvedFixedCompensations,
    )
    // The revealed first-workweek cell is seeded from the API total, which would
    // clobber a value the user already edited in the collapsed input. Overlay the
    // live collapsed value (the single key of a not-yet-split row) onto the first
    // workweek cell so the edit persists into the split view instead of reverting
    // to the server value.
    const firstWeekStart = workweeks[0]?.startDate ?? ''
    const currentValues = formMethods.getValues()
    const overlayLiveFirstWeek = (
      revealed: PayrollEditEmployeeFormData['hours'],
      live: PayrollEditEmployeeFormData['hours'] | undefined,
    ) => {
      for (const [jobUuid, names] of Object.entries(revealed)) {
        for (const [name, weekMap] of Object.entries(names)) {
          const liveValue = live?.[jobUuid]?.[name]?.[firstWeekStart]
          if (liveValue !== undefined) weekMap[firstWeekStart] = liveValue
        }
      }
      return revealed
    }
    // Flipping `withOvertimeSetByUser` recomputes `resolvedDefaults` and the
    // `values` prop resets the form to it (keeping only dirty fields). Mark the
    // seeded values dirty so that reset preserves them instead of reverting the
    // overlaid live edit back to the API total.
    formMethods.setValue(
      'hours',
      overlayLiveFirstWeek(revealedDefaults.hours, currentValues.hours),
      { shouldDirty: true },
    )
    formMethods.setValue(
      'additionalEarnings',
      overlayLiveFirstWeek(revealedDefaults.additionalEarnings, currentValues.additionalEarnings),
      { shouldDirty: true },
    )
  }
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
              withOvertime,
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

            // The payroll configuration surface caches its prepared payroll under a hand-written
            // key, which the global SDK auto-invalidation (namespaced to @gusto/embedded-api
            // queries only) does not touch. Invalidate it explicitly so configuration reflects
            // this edit without a manual refresh.
            await queryClient.invalidateQueries({
              queryKey: [PREPARE_QUERY_KEY, payrollId],
            })

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
      grossPay: Number(employeeCompensation?.grossPay ?? 0),
      paySchedule: payScheduleQuery.data?.payScheduleShow,
      isMultipleWorkweeks: workweeks.length > 1,
      workweeks,
      isOvertimeEligible,
      withOvertime,
      hasDirectDepositSetup,
      ...(showReimbursements ? { reimbursements: reimbursementRows } : {}),
    },
    status: { isPending, mode: 'update' as const },
    actions: {
      onSubmit,
      addOvertime,
      ...(showReimbursements
        ? {
            beginAddReimbursement,
            saveReimbursement,
            cancelReimbursement,
            removeReimbursement,
          }
        : {}),
    },
    errorHandling,
    form: {
      Fields: {
        ...fields,
        timeOff: timeOffFields,
        reimbursementDraft: showReimbursements ? reimbursementDraftFields : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
      ...(showReimbursements ? { reimbursementDraft: { isAdding: isAddingReimbursement } } : {}),
    },
  }
}
