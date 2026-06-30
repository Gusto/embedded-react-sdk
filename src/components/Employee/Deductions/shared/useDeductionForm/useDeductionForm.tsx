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

/**
 * Configuration options for {@link useDeductionForm}.
 *
 * @remarks
 * Presence or absence of `garnishmentId` selects the API verb — see the
 * `garnishmentId` field description. `courtOrdered` selects between the
 * post-tax custom variant and the court-ordered garnishment variant.
 *
 * @public
 */
export interface UseDeductionFormProps {
  /** UUID of the employee whose deduction is being created or edited. */
  employeeId: string
  /**
   * When set, loads that garnishment and updates it (PUT). When omitted, the
   * form is in create mode (POST).
   */
  garnishmentId?: string
  /**
   * Court-ordered deductions are stored as garnishments with `courtOrdered: true`
   * and require a `garnishmentType` (Federal Tax Lien, Student Loan, etc.).
   * When `false`, the form is for a "custom" post-tax deduction —
   * `garnishmentType` is excluded from the schema and submit payload.
   *
   * Note: this hook does NOT handle `garnishmentType: 'child_support'`. Use
   * {@link useChildSupportGarnishmentForm} for child-support agency-keyed payloads.
   */
  courtOrdered: boolean
  /** Override fields that are optional on a given mode to be required. See {@link DeductionFormOptionalFieldsToRequire}. */
  optionalFieldsToRequire?: DeductionFormOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update. */
  defaultValues?: Partial<DeductionFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useDeductionForm().form.Fields`.
 *
 * @remarks
 * Each property is either the field component or `undefined`. A field is
 * `undefined` when conditions for rendering it aren't met — see each member
 * for its visibility rule. Always null-check conditional fields (e.g.
 * `{Fields.TotalAmount && <Fields.TotalAmount ... />}`) before rendering.
 *
 * @public
 */
export interface DeductionFormFields {
  /** Description text input. Always available. */
  Description: typeof DescriptionField
  /** Recurring vs one-time radio group. Always available. */
  Recurring: typeof RecurringField
  /** Fixed-amount vs percentage radio group. Always available. */
  DeductAsPercentage: typeof DeductAsPercentageField
  /** Deduction amount input. Always available. */
  Amount: typeof AmountField
  /** Only available when `status.isRecurring` is true. */
  TotalAmount: typeof TotalAmountField | undefined
  /** Only available when `status.isRecurring` is true. */
  AnnualMaximum: typeof AnnualMaximumField | undefined
  /** Only available when `courtOrdered: true`. */
  GarnishmentType: typeof GarnishmentTypeField | undefined
}

/**
 * Ready-state shape returned by {@link useDeductionForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the deduction-specific `data`, `status`, `actions`, and `form.Fields` shape.
 * Static, entity-derived values live under `data.*`; reactive values that
 * flip with form input live under `status.*`.
 *
 * @public
 */
export interface UseDeductionFormReady extends BaseFormHookReady<
  FieldsMetadata,
  DeductionFormData,
  DeductionFormFields
> {
  /** Deduction-specific data payload: the loaded garnishment for update mode, or `null` in create mode. */
  data: {
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  /** Submission state and reactive flags derived from current form input. */
  status: {
    /** `true` while a create or update mutation is in flight. */
    isPending: boolean
    /** Reflects whether the next submit will POST a new deduction or PUT an existing one. */
    mode: 'create' | 'update'
    /**
     * Mirrors the watched `recurring` value. Cap fields (`TotalAmount`,
     * `AnnualMaximum`) are only included on `Fields` when this is true — the
     * consumer can render them unconditionally and the gating happens in the
     * hook.
     */
    isRecurring: boolean
  }
  /** Submission action. */
  actions: {
    /** Submits the form. Returns the saved garnishment + mode on success, or `undefined` when validation fails or the request errored. */
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

/**
 * Return value of {@link useDeductionForm}.
 *
 * @remarks
 * Discriminated union: {@link HookLoadingResult} while the existing garnishment
 * is loading (update mode only); {@link UseDeductionFormReady} once data is
 * ready. In create mode the hook returns the ready branch immediately.
 *
 * @public
 */
export type UseDeductionFormResult = HookLoadingResult | UseDeductionFormReady

/**
 * Headless hook for creating or updating a non-child-support deduction.
 *
 * @remarks
 * Both variants — post-tax custom deductions and court-ordered garnishments —
 * share the same field set (description, frequency, deduct-as-percentage,
 * amount, optional caps) and differ only in whether the deduction is
 * court-ordered and carries a `garnishmentType`. Set `courtOrdered: true` to
 * surface the garnishment-type select; set it to `false` for a custom post-tax
 * deduction.
 *
 * Presence or absence of `garnishmentId` selects the API verb: omit it to POST
 * a new deduction, supply it to PUT updates against the existing row. For
 * child-support garnishments, use {@link useChildSupportGarnishmentForm}
 * instead — those require agency-keyed required attributes (case number,
 * order number, remittance number, county) that this hook doesn't model.
 *
 * @param input - See {@link UseDeductionFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseDeductionFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useDeductionForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function CustomDeductionPage({ employeeId, garnishmentId }: { employeeId: string; garnishmentId?: string }) {
 *   const form = useDeductionForm({ employeeId, garnishmentId, courtOrdered: false })
 *
 *   if (form.isLoading) return <p>Loading…</p>
 *
 *   const { Fields } = form.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={form}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void form.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.Description label="Description" validationMessages={{ REQUIRED: 'Required' }} />
 *         <Fields.Recurring
 *           label="Frequency"
 *           getOptionLabel={v => (v ? 'Recurring' : 'One-time')}
 *           validationMessages={{ REQUIRED: 'Required' }}
 *         />
 *         <Fields.Amount
 *           label="Amount"
 *           validationMessages={{ REQUIRED: 'Required', NEGATIVE_AMOUNT: 'Must be ≥ 0' }}
 *         />
 *         {Fields.TotalAmount && (
 *           <Fields.TotalAmount label="Total cap" validationMessages={{ NEGATIVE_AMOUNT: 'Must be ≥ 0' }} />
 *         )}
 *         <button type="submit">Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
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

/**
 * Per-field metadata returned by {@link useDeductionForm} as `form.fieldsMetadata`.
 *
 * @remarks
 * Carries per-field `isRequired`, `isDisabled`, label, description, and option
 * entries derived from the schema and form state. Use these to drive UI such
 * as disabled state or option lists when not relying on the pre-bound
 * {@link DeductionFormFields} components.
 *
 * @public
 */
export type DeductionFormFieldsMetadata = UseDeductionFormReady['form']['fieldsMetadata']

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
