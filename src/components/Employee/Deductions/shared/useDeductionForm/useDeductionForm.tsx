import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type Garnishment,
  type GarnishmentType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsUpdate'
import { useGarnishmentsList } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsList'
import {
  createDeductionFormSchema,
  type DeductionFormData,
  type DeductionFormOutputs,
  type DeductionFormOptionalFieldsToRequire,
} from './deductionFormSchema'
import {
  DescriptionField,
  RecurringField,
  DeductAsPercentageField,
  AmountField,
  TotalAmountField,
  AnnualMaximumField,
  GarnishmentTypeField,
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

export type { DeductionFormOptionalFieldsToRequire } from './deductionFormSchema'

// GarnishmentType is a runtime enum; the schema gates which values are valid.
// The hook's `withOptions` entries below carry the raw enum values so the
// consumer can supply translated labels via `getOptionLabel` on the field.
//
// `'child_support'` is intentionally omitted — child-support garnishments
// require agency-keyed required attributes (case number, order number,
// remittance number, county) that this hook doesn't model. Use
// `useChildSupportGarnishmentForm` for those.
const GARNISHMENT_TYPES: readonly GarnishmentType[] = [
  'federal_tax_lien',
  'state_tax_lien',
  'student_loan',
  'creditor_garnishment',
  'federal_loan',
  'other_garnishment',
] as const

export interface UseDeductionFormProps {
  employeeId: string
  /**
   * When set, loads that garnishment via the list query and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  garnishmentId?: string
  /**
   * Court-ordered deductions are stored as garnishments with `courtOrdered: true`
   * and require a `garnishmentType` (Federal Tax Lien, Student Loan, etc.).
   * When `false`, the form is for a "custom" post-tax deduction —
   * `garnishmentType` is excluded from the schema and submit payload.
   *
   * Note: this hook does NOT handle `garnishmentType: 'child_support'`. Use
   * `useChildSupportGarnishmentForm` for child-support agency-keyed payloads.
   */
  courtOrdered: boolean
  optionalFieldsToRequire?: DeductionFormOptionalFieldsToRequire
  defaultValues?: Partial<DeductionFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface DeductionFormFields {
  Description: typeof DescriptionField
  Recurring: typeof RecurringField
  DeductAsPercentage: typeof DeductAsPercentageField
  Amount: typeof AmountField
  /** Only available when `status.isRecurring` is true. */
  TotalAmount: typeof TotalAmountField | undefined
  /** Only available when `status.isRecurring` is true. */
  AnnualMaximum: typeof AnnualMaximumField | undefined
  /** Only available when `courtOrdered: true`. */
  GarnishmentType: typeof GarnishmentTypeField | undefined
}

export interface UseDeductionFormReady extends BaseFormHookReady<
  FieldsMetadata,
  DeductionFormData,
  DeductionFormFields
> {
  data: {
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /**
     * Mirrors the watched `recurring` value. Cap fields (`TotalAmount`,
     * `AnnualMaximum`) are only included on `Fields` when this is true — the
     * consumer can render them unconditionally and the gating happens in the
     * hook.
     */
    isRecurring: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

export type UseDeductionFormResult = HookLoadingResult | UseDeductionFormReady

export function useDeductionForm({
  employeeId,
  garnishmentId,
  courtOrdered,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseDeductionFormProps): UseDeductionFormResult {
  const isCreateMode = !garnishmentId
  const schemaMode = isCreateMode ? 'create' : 'update'

  // The garnishments API has no single-row GET — the list endpoint is the only
  // way to retrieve an existing garnishment. We use the (non-suspense) list
  // query and pick the matching row by uuid.
  const garnishmentsListQuery = useGarnishmentsListMutationLikeLoader({
    employeeId,
    enabled: !isCreateMode,
  })

  const fetchedDeduction = useMemo(() => {
    if (isCreateMode) return null
    return garnishmentsListQuery.data?.find(g => g.uuid === garnishmentId) ?? null
  }, [isCreateMode, garnishmentId, garnishmentsListQuery.data])

  const [schema, metadataConfig] = useMemo(
    () =>
      createDeductionFormSchema({
        mode: schemaMode,
        courtOrdered,
        optionalFieldsToRequire,
      }),
    [schemaMode, courtOrdered, optionalFieldsToRequire],
  )

  const resolvedDefaults: DeductionFormData = useMemo(
    () => ({
      description: fetchedDeduction?.description ?? partnerDefaults?.description ?? '',
      recurring: fetchedDeduction?.recurring ?? partnerDefaults?.recurring ?? true,
      deductAsPercentage:
        fetchedDeduction?.deductAsPercentage ?? partnerDefaults?.deductAsPercentage ?? true,
      amount: fetchedDeduction?.amount
        ? Number(fetchedDeduction.amount)
        : (partnerDefaults?.amount ?? 0),
      // Caps stay as numbers in the form (0 means "no cap"); the hook drops
      // them to null on the wire in onSubmit.
      totalAmount: fetchedDeduction?.totalAmount
        ? Number(fetchedDeduction.totalAmount)
        : (partnerDefaults?.totalAmount ?? 0),
      annualMaximum: fetchedDeduction?.annualMaximum
        ? Number(fetchedDeduction.annualMaximum)
        : (partnerDefaults?.annualMaximum ?? 0),
      garnishmentType:
        fetchedDeduction?.garnishmentType ??
        partnerDefaults?.garnishmentType ??
        // First non-child-support type — partners typically pick via the
        // GarnishmentType select before saving.
        'federal_tax_lien',
    }),
    [fetchedDeduction, partnerDefaults],
  )

  const formMethods = useForm<DeductionFormData, unknown, DeductionFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  // The cap fields only appear when the deduction is recurring. Watching here
  // (inside the hook) keeps the consumer from having to reach into
  // hookFormInternals — the conditional Fields below flip to `undefined`.
  // The `recurring` RadioGroup round-trips its value as the strings `'true'`/
  // `'false'` (only the zod preprocessor coerces to a real boolean at
  // validation time). The string `'false'` is truthy, so reading the raw
  // watched value here would leave the cap fields visible for one-time
  // deductions after a frequency toggle. Compare against both shapes — mirrors
  // the `deductAsPercentage` handling in StandardDeductionForm.
  const watchedRecurring = useWatch({ control: formMethods.control, name: 'recurring' }) as
    | boolean
    | 'true'
    | 'false'
    | undefined
  const isRecurring = watchedRecurring === true || watchedRecurring === 'true'

  const createGarnishmentMutation = useGarnishmentsCreateMutation()
  const updateGarnishmentMutation = useGarnishmentsUpdateMutation()
  const isPending = createGarnishmentMutation.isPending || updateGarnishmentMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('DeductionForm')

  const queriesForErrors = !isCreateMode ? [garnishmentsListQuery] : []
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  const garnishmentTypeOptions = GARNISHMENT_TYPES.map(value => ({ value, label: value }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    description: baseMetadata.description,
    recurring: withOptions<boolean>(
      baseMetadata.recurring,
      [
        { value: 'true', label: 'true' },
        { value: 'false', label: 'false' },
      ],
      [true, false],
    ),
    deductAsPercentage: withOptions<boolean>(
      baseMetadata.deductAsPercentage,
      [
        { value: 'true', label: 'true' },
        { value: 'false', label: 'false' },
      ],
      [true, false],
    ),
    amount: baseMetadata.amount,
    totalAmount: baseMetadata.totalAmount,
    annualMaximum: baseMetadata.annualMaximum,
    garnishmentType: courtOrdered
      ? withOptions(baseMetadata.garnishmentType, garnishmentTypeOptions, GARNISHMENT_TYPES)
      : baseMetadata.garnishmentType,
  }

  const onSubmit = async (): Promise<HookSubmitResult<Garnishment> | undefined> => {
    let submitResult: HookSubmitResult<Garnishment> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: DeductionFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            // The API's `times` column is "number of remaining occurrences" —
            // for one-time deductions we set it to 1, for recurring we null it
            // out. Matches the legacy GarnishmentForm/CustomDeductionForm.
            const times = payload.recurring ? null : 1
            // Wire conversions: amount is always a string; the optional caps
            // collapse to undefined when the partner left them at zero.
            const amountStr = String(payload.amount)
            const totalAmountStr = payload.totalAmount > 0 ? String(payload.totalAmount) : undefined
            const annualMaximumStr =
              payload.annualMaximum > 0 ? String(payload.annualMaximum) : undefined

            let updated: Garnishment | undefined

            if (isCreateMode) {
              const result = await createGarnishmentMutation.mutateAsync({
                request: {
                  employeeId,
                  garnishmentRequest: {
                    active: true,
                    description: payload.description,
                    recurring: payload.recurring,
                    deductAsPercentage: payload.deductAsPercentage,
                    amount: amountStr,
                    totalAmount: totalAmountStr,
                    annualMaximum: annualMaximumStr,
                    courtOrdered,
                    garnishmentType: courtOrdered ? payload.garnishmentType : undefined,
                    times,
                  },
                },
              })
              updated = result.garnishment
            } else {
              if (!fetchedDeduction) {
                throw new SDKInternalError(
                  'Cannot update deduction: no matching garnishment on file',
                )
              }
              const result = await updateGarnishmentMutation.mutateAsync({
                request: {
                  garnishmentId: fetchedDeduction.uuid,
                  updateGarnishmentRequest: {
                    version: fetchedDeduction.version as string,
                    active: true,
                    description: payload.description,
                    recurring: payload.recurring,
                    deductAsPercentage: payload.deductAsPercentage,
                    amount: amountStr,
                    totalAmount: totalAmountStr,
                    annualMaximum: annualMaximumStr,
                    courtOrdered,
                    // The API rejects garnishment_type changes on update — only
                    // include when court-ordered AND when matching the loaded
                    // row's type (no-op pass-through).
                    garnishmentType: courtOrdered ? payload.garnishmentType : undefined,
                    times,
                  },
                },
              })
              updated = result.garnishment
            }

            if (!updated) {
              throw new SDKInternalError(
                isCreateMode ? 'Deduction creation failed' : 'Deduction update failed',
              )
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updated,
            }
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

  if (!isCreateMode && garnishmentsListQuery.isLoading) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      deduction: fetchedDeduction,
    },
    status: {
      isPending,
      mode: isCreateMode ? 'create' : 'update',
      isRecurring,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Description: DescriptionField,
        Recurring: RecurringField,
        DeductAsPercentage: DeductAsPercentageField,
        Amount: AmountField,
        TotalAmount: isRecurring ? TotalAmountField : undefined,
        AnnualMaximum: isRecurring ? AnnualMaximumField : undefined,
        GarnishmentType: courtOrdered ? GarnishmentTypeField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type DeductionFormFieldsMetadata = UseDeductionFormReady['form']['fieldsMetadata']
export type DeductionFormFieldsType = UseDeductionFormReady['form']['Fields']

// ── Internal loader ─────────────────────────────────────────────────────
//
// `useGarnishmentsList` is the only way to retrieve an existing garnishment
// row — the API has no single-row GET. We expose a tiny wrapper that returns
// the array directly so the hook above can `.find()` by uuid. Skips the fetch
// entirely in create mode via `enabled: false`.

function useGarnishmentsListMutationLikeLoader({
  employeeId,
  enabled,
}: {
  employeeId: string
  enabled: boolean
}) {
  const query = useGarnishmentsList({ employeeId }, { enabled })
  return {
    data: query.data?.garnishments,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
