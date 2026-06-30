import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeFederalTax } from '@gusto/embedded-api-v-2026-06-15/models/components/employeefederaltax'
import type { EmployeeFederalTaxRev2020 } from '@gusto/embedded-api-v-2026-06-15/models/components/employeefederaltaxrev2020'
import { useEmployeeTaxSetupGetFederalTaxes } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeTaxSetupUpdateFederalTaxes'
import type {
  FilingStatus,
  PutV1EmployeesEmployeeIdFederalTaxesRequestBody,
} from '@gusto/embedded-api-v-2026-06-15/models/operations/putv1employeesemployeeidfederaltaxes'
import {
  createFederalTaxesSchema,
  FILING_STATUS_VALUES,
  type FederalTaxesOptionalFieldsToRequire,
  type FederalTaxesFormData,
  type FederalTaxesFormOutputs,
  type FilingStatusValue,
} from './federalTaxesSchema'
import {
  FilingStatusField,
  TwoJobsField,
  DependentsAmountField,
  OtherIncomeField,
  DeductionsField,
  ExtraWithholdingField,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

export type { FederalTaxesOptionalFieldsToRequire } from './federalTaxesSchema'

/**
 * Configuration options for {@link useFederalTaxesForm}.
 *
 * @remarks
 * The federal tax record is created automatically with the employee, so the
 * hook is always in update mode and only `employeeId` is required.
 *
 * @public
 */
export interface UseFederalTaxesFormProps {
  /** UUID of the employee whose federal tax record is being updated. */
  employeeId: string
  /** Override fields that are optional on update to be required. By default only `filingStatus` is required; pass `{ update: ['twoJobs', 'dependentsAmount', 'otherIncome', 'deductions', 'extraWithholding'] }` to require any subset. See {@link FederalTaxesOptionalFieldsToRequire}. */
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence when the employee already has values on file. */
  defaultValues?: Partial<FederalTaxesFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useFederalTaxesForm().form.Fields`.
 *
 * @public
 */
export interface FederalTaxesFields {
  /** Filing status select. */
  FilingStatus: typeof FilingStatusField
  /** Multiple-jobs (Step 2c) radio group. */
  TwoJobs: typeof TwoJobsField
  /** Dependents amount (Step 3) currency input. */
  DependentsAmount: typeof DependentsAmountField
  /** Other income (Step 4a) currency input. */
  OtherIncome: typeof OtherIncomeField
  /** Deductions (Step 4b) currency input. */
  Deductions: typeof DeductionsField
  /** Extra withholding (Step 4c) currency input. */
  ExtraWithholding: typeof ExtraWithholdingField
}

/**
 * Ready-state shape returned by {@link useFederalTaxesForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the federal-taxes specific `data`, `status`, and `actions`.
 *
 * @public
 */
export interface UseFederalTaxesFormReady extends BaseFormHookReady<
  FieldsMetadata,
  FederalTaxesFormData,
  FederalTaxesFields
> {
  /** The loaded federal tax record. */
  data: {
    /** The current federal tax record for the employee. */
    employeeFederalTax: EmployeeFederalTax
  }
  /** Submission state. `mode` is always `'update'` — the federal tax record is created with the employee, so this hook has no create mode. */
  status: {
    /** `true` while the update mutation is in flight. */
    isPending: boolean
    /** Always `'update'` — the federal tax record is created when the employee is created. */
    mode: 'update'
  }
  /** Submit actions exposed by the hook. */
  actions: {
    /** Validates the form, runs the update mutation, and resolves to a {@link HookSubmitResult} containing the updated record. Resolves to `undefined` on validation failure or mutation error. */
    onSubmit: () => Promise<HookSubmitResult<EmployeeFederalTax> | undefined>
  }
}

function isRev2020(federalTax: EmployeeFederalTax): federalTax is EmployeeFederalTaxRev2020 {
  return federalTax.w4DataType === 'rev_2020_w4'
}

function toFilingStatus(value: string | null | undefined): FilingStatusValue | '' {
  if (!value) return ''
  return FILING_STATUS_VALUES.find(allowed => allowed === value) ?? ''
}

function toNumber(value: string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Headless hook for updating an employee's federal tax (W-4) withholding information — filing status, multiple-jobs flag, dependents, other income, deductions, and extra withholding.
 *
 * @remarks
 * The federal tax record is created automatically with the employee, so this hook is always in update mode. Only the revised 2020 W-4 format is supported for updates. By default only `filingStatus` is required; promote any of `twoJobs`, `dependentsAmount`, `otherIncome`, `deductions`, or `extraWithholding` to required via `optionalFieldsToRequire.update`.
 *
 * @param props - See {@link UseFederalTaxesFormProps}.
 * @returns A {@link HookLoadingResult} while data is loading, or a {@link UseFederalTaxesFormReady} once the federal tax record is loaded.
 * @public
 *
 * @example
 * ```tsx
 * import { useFederalTaxesForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function FederalTaxesPage({ employeeId }: { employeeId: string }) {
 *   const federalTaxes = useFederalTaxesForm({ employeeId })
 *
 *   if (federalTaxes.isLoading) return <div>Loading...</div>
 *
 *   const { Fields } = federalTaxes.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={federalTaxes}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void federalTaxes.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.FilingStatus label="Federal filing status" />
 *         <Fields.TwoJobs label="Multiple jobs (2c)" />
 *         <Fields.DependentsAmount label="Dependents" />
 *         <Fields.OtherIncome label="Other income" />
 *         <Fields.Deductions label="Deductions" />
 *         <Fields.ExtraWithholding label="Extra withholding" />
 *         <button type="submit" disabled={federalTaxes.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useFederalTaxesForm({
  employeeId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseFederalTaxesFormProps): HookLoadingResult | UseFederalTaxesFormReady {
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxes({ employeeUuid: employeeId })

  const employeeFederalTax = federalTaxesQuery.data?.employeeFederalTax

  const [schema, metadataConfig] = useMemo(
    () => createFederalTaxesSchema({ optionalFieldsToRequire }),
    [optionalFieldsToRequire],
  )

  const filingStatusOptions = useMemo(
    () => FILING_STATUS_VALUES.map(value => ({ value, label: value })),
    [],
  )

  const twoJobsOptions = useMemo(
    () => [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    [],
  )

  const resolvedDefaults: FederalTaxesFormData = useMemo(() => {
    const rev2020Source =
      employeeFederalTax && isRev2020(employeeFederalTax) ? employeeFederalTax : undefined

    const fromServerFilingStatus = toFilingStatus(rev2020Source?.filingStatus)

    return {
      filingStatus: fromServerFilingStatus || partnerDefaults?.filingStatus || '',
      twoJobs: rev2020Source?.twoJobs ?? partnerDefaults?.twoJobs ?? false,
      dependentsAmount:
        toNumber(rev2020Source?.dependentsAmount) ?? partnerDefaults?.dependentsAmount ?? 0,
      otherIncome: toNumber(rev2020Source?.otherIncome) ?? partnerDefaults?.otherIncome ?? 0,
      deductions: toNumber(rev2020Source?.deductions) ?? partnerDefaults?.deductions ?? 0,
      extraWithholding:
        toNumber(rev2020Source?.extraWithholding) ?? partnerDefaults?.extraWithholding ?? 0,
    }
  }, [employeeFederalTax, partnerDefaults])

  const formMethods = useForm<FederalTaxesFormData, unknown, FederalTaxesFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const { mutateAsync: updateFederalTaxes, isPending } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('FederalTaxesForm')

  const errorHandling = composeErrorHandler([federalTaxesQuery], { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    filingStatus: withOptions<FilingStatusValue>(
      baseMetadata.filingStatus,
      filingStatusOptions,
      FILING_STATUS_VALUES,
    ),
    twoJobs: withOptions<boolean>(baseMetadata.twoJobs, twoJobsOptions, [true, false]),
    dependentsAmount: baseMetadata.dependentsAmount,
    otherIncome: baseMetadata.otherIncome,
    deductions: baseMetadata.deductions,
    extraWithholding: baseMetadata.extraWithholding,
  }

  const onSubmit = async (): Promise<HookSubmitResult<EmployeeFederalTax> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeFederalTax> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: FederalTaxesFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            if (!employeeFederalTax) {
              throw new SDKInternalError('Federal taxes record was not loaded before submit')
            }

            const requestBody: PutV1EmployeesEmployeeIdFederalTaxesRequestBody = {
              filingStatus: payload.filingStatus as FilingStatus,
              twoJobs: payload.twoJobs,
              dependentsAmount: payload.dependentsAmount,
              otherIncome: payload.otherIncome,
              deductions: payload.deductions,
              extraWithholding: payload.extraWithholding,
              w4DataType: 'rev_2020_w4',
              version: employeeFederalTax.version,
            }

            const response = await updateFederalTaxes({
              request: {
                employeeUuid: employeeId,
                requestBody,
              },
            })

            if (!response.employeeFederalTax) {
              throw new SDKInternalError('Federal taxes update did not return an updated record')
            }

            submitResult = { mode: 'update', data: response.employeeFederalTax }
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

  const hookFormInternals = useHookFormInternals(formMethods)

  if (federalTaxesQuery.isLoading || !employeeFederalTax) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      employeeFederalTax,
    },
    status: {
      isPending,
      mode: 'update' as const,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        FilingStatus: FilingStatusField,
        TwoJobs: TwoJobsField,
        DependentsAmount: DependentsAmountField,
        OtherIncome: OtherIncomeField,
        Deductions: DeductionsField,
        ExtraWithholding: ExtraWithholdingField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useFederalTaxesForm} — either the loading state or the ready state.
 *
 * @remarks
 * Use this type when threading the hook result through helpers (e.g.
 * presentational components). Discriminate on `isLoading` to narrow to
 * {@link UseFederalTaxesFormReady}.
 *
 * @public
 */
export type UseFederalTaxesFormResult = HookLoadingResult | UseFederalTaxesFormReady

/**
 * Metadata for each {@link useFederalTaxesForm} field, exposed on `form.fieldsMetadata`.
 *
 * @remarks
 * Includes per-field `isDisabled`, `isRequired`, and the dynamic option list
 * for select and radio fields (`filingStatus`, `twoJobs`).
 *
 * @public
 */
export type FederalTaxesFieldsMetadata = UseFederalTaxesFormReady['form']['fieldsMetadata']

/**
 * Pre-bound field components exposed on `useFederalTaxesForm().form.Fields`.
 *
 * @remarks
 * Alias for the `Fields` shape on {@link UseFederalTaxesFormReady}. Use this
 * type when typing a presentational component that consumes the hook's
 * fields.
 *
 * @public
 */
export type FederalTaxesFormFields = UseFederalTaxesFormReady['form']['Fields']
