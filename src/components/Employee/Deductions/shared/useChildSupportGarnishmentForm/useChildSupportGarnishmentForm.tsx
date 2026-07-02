import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type Garnishment,
  type GarnishmentType,
} from '@gusto/embedded-api-v-2026-02-01/models/components/garnishment'
import type { Agencies } from '@gusto/embedded-api-v-2026-02-01/models/components/childsupportdata'
import { PaymentPeriod } from '@gusto/embedded-api-v-2026-02-01/models/components/garnishmentchildsupport'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/garnishmentsUpdate'
import { useGarnishmentsList } from '@gusto/embedded-api-v-2026-02-01/react-query/garnishmentsList'
import { useGarnishmentsGetChildSupportData } from '@gusto/embedded-api-v-2026-02-01/react-query/garnishmentsGetChildSupportData'
import {
  createChildSupportGarnishmentFormSchema,
  getRequiredAttrKeys,
  type ChildSupportGarnishmentFormData,
  type ChildSupportGarnishmentFormOutputs,
  type SupportedRequiredAttrKey,
} from './childSupportGarnishmentFormSchema'
import {
  StateField,
  FipsCodeField,
  CaseNumberField,
  OrderNumberField,
  RemittanceNumberField,
  PayPeriodMaximumField,
  AmountField,
  PaymentPeriodField,
  type CountyEntry,
  type StateFieldEntry,
  type StateFieldProps,
  type FipsCodeFieldProps,
  type CaseNumberFieldProps,
  type OrderNumberFieldProps,
  type RemittanceNumberFieldProps,
  type PayPeriodMaximumFieldProps,
  type AmountFieldProps,
  type PaymentPeriodFieldProps,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

const PAYMENT_PERIOD_OPTIONS = [
  { value: PaymentPeriod.EveryWeek, label: PaymentPeriod.EveryWeek },
  { value: PaymentPeriod.EveryOtherWeek, label: PaymentPeriod.EveryOtherWeek },
  { value: PaymentPeriod.TwicePerMonth, label: PaymentPeriod.TwicePerMonth },
  { value: PaymentPeriod.Monthly, label: PaymentPeriod.Monthly },
] as const

const PAYMENT_PERIOD_ENTRIES = [
  PaymentPeriod.EveryWeek,
  PaymentPeriod.EveryOtherWeek,
  PaymentPeriod.TwicePerMonth,
  PaymentPeriod.Monthly,
] as const

/**
 * Configuration options for {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Presence or absence of `garnishmentId` selects the API verb — see the
 * `garnishmentId` field description.
 *
 * @public
 */
export interface UseChildSupportGarnishmentFormProps {
  /** UUID of the employee whose child-support garnishment is being created or edited. */
  employeeId: string
  /**
   * When set, loads that garnishment and updates it (PUT). When omitted, the
   * form is in create mode (POST).
   */
  garnishmentId?: string
  /** Pre-fill form values. Server data takes precedence on update. */
  defaultValues?: Partial<ChildSupportGarnishmentFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useChildSupportGarnishmentForm().form.Fields`.
 *
 * @remarks
 * Each property is either the field component or `undefined`. A field is
 * `undefined` when conditions for rendering it aren't met — see each member
 * for its visibility rule. Always null-check conditional fields (e.g.
 * `{Fields.FipsCode && <Fields.FipsCode ... />}`) before rendering.
 *
 * @public
 */
export interface ChildSupportGarnishmentFormFields {
  /** Bound to `state`. Agency (state) select. Always available. */
  State: ComponentType<StateFieldProps>
  /** Bound to `fipsCode`. Only available when the selected agency has more than
   *  one fips code, or the sole code is county-scoped (not an "all counties"
   *  auto-pick). */
  FipsCode: ComponentType<FipsCodeFieldProps> | undefined
  /** Bound to `caseNumber`. Only available when the selected agency requires `case_number`. */
  CaseNumber: ComponentType<CaseNumberFieldProps> | undefined
  /** Bound to `orderNumber`. Only available when the selected agency requires `order_number`. */
  OrderNumber: ComponentType<OrderNumberFieldProps> | undefined
  /** Bound to `remittanceNumber`. Only available when the selected agency requires `remittance_number`. */
  RemittanceNumber: ComponentType<RemittanceNumberFieldProps> | undefined
  /** Bound to `payPeriodMaximum`. Per-pay-period currency cap input. Always available. */
  PayPeriodMaximum: ComponentType<PayPeriodMaximumFieldProps>
  /** Bound to `amount`. Percent-of-paycheck input (0–100). Always available. */
  Amount: ComponentType<AmountFieldProps>
  /** Bound to `paymentPeriod`. Payment period select. Always available. */
  PaymentPeriod: ComponentType<PaymentPeriodFieldProps>
}

/**
 * Ready-state shape returned by {@link useChildSupportGarnishmentForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the child-support-specific `data`, `status`, `actions`, and `form.Fields`
 * shape. Static, entity-derived values live under `data.*`; reactive values
 * that flip with form input live under `status.*`.
 *
 * @public
 */
export interface UseChildSupportGarnishmentFormReady extends BaseFormHookReady<
  ChildSupportGarnishmentFormFieldsMetadata,
  ChildSupportGarnishmentFormData,
  ChildSupportGarnishmentFormFields
> {
  /** Child-support-specific data payload: the available agencies, counties for the selected state, and the loaded garnishment for update mode. */
  data: {
    /** Agencies offered as `State` options; raw entries the consumer can use
     *  with `getOptionLabel` for translated names. */
    agencies: StateFieldEntry[]
    /** Counties for the currently selected state. Empty array when no state
     *  is selected. */
    counties: CountyEntry[]
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  /** Submission state and reactive flags derived from current form input. */
  status: {
    /** `true` while a create or update mutation is in flight. */
    isPending: boolean
    /** Reflects whether the next submit will POST a new garnishment or PUT an existing one. */
    mode: 'create' | 'update'
    /** The agency record matching the currently selected `state`. */
    selectedAgency: Agencies | null
    /** Mirrors `selectedAgency.manualPaymentRequired`; convenient for showing
     *  a warning alert. */
    isManualPaymentRequired: boolean
    /** Which `required_attributes` keys the selected agency declares. */
    requiredAttrKeys: ReadonlySet<SupportedRequiredAttrKey>
  }
  /** Submission action. */
  actions: {
    /** Submits the form. Returns the saved garnishment + mode on success, or `undefined` when validation fails or the request errored. */
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

/**
 * Return value of {@link useChildSupportGarnishmentForm}.
 *
 * @remarks
 * Discriminated union: {@link HookLoadingResult} while the agency catalog (and,
 * in update mode, the existing garnishment) is loading;
 * {@link UseChildSupportGarnishmentFormReady} once data is ready.
 *
 * @public
 */
export type UseChildSupportGarnishmentFormResult =
  HookLoadingResult | UseChildSupportGarnishmentFormReady

/** @internal */
function buildChildSupportGarnishmentFieldsMetadata(
  base: Record<keyof ChildSupportGarnishmentFormData, FieldMetadata>,
  {
    stateOptions,
    agencies,
    countyOptions,
    counties,
  }: {
    stateOptions: Array<{ value: string; label: string }>
    agencies: StateFieldEntry[]
    countyOptions: Array<{ value: string; label: string }>
    counties: CountyEntry[]
  },
) {
  return {
    state: withOptions(base.state, stateOptions, agencies),
    fipsCode: withOptions(base.fipsCode, countyOptions, counties),
    caseNumber: base.caseNumber,
    orderNumber: base.orderNumber,
    remittanceNumber: base.remittanceNumber,
    payPeriodMaximum: base.payPeriodMaximum,
    amount: base.amount,
    paymentPeriod: withOptions(
      base.paymentPeriod,
      [...PAYMENT_PERIOD_OPTIONS],
      [...PAYMENT_PERIOD_ENTRIES],
    ),
  } satisfies FieldsMetadata
}

/**
 * Headless hook for creating or updating a child-support garnishment.
 *
 * @remarks
 * Unlike standard garnishments, child support requires agency-specific
 * attributes (case number, order number, remittance number) that vary by
 * state, plus an optional county selection when the state has multiple
 * counties. The hook loads the agency catalog from the Gusto API, derives
 * which attributes the selected state requires, and exposes the right Fields
 * conditionally.
 *
 * Presence or absence of `garnishmentId` selects the API verb: omit it to
 * POST a new garnishment, supply it to PUT updates against the existing row.
 * For non-child-support deductions (court-ordered garnishments and post-tax
 * custom), use {@link useDeductionForm} instead.
 *
 * @param input - See {@link UseChildSupportGarnishmentFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseChildSupportGarnishmentFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useChildSupportGarnishmentForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function ChildSupportPage({ employeeId, garnishmentId }: { employeeId: string; garnishmentId?: string }) {
 *   const form = useChildSupportGarnishmentForm({ employeeId, garnishmentId })
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
 *         <Fields.State
 *           label="Agency"
 *           getOptionLabel={entry => entry.name}
 *           validationMessages={{ REQUIRED: 'Required' }}
 *         />
 *         {Fields.CaseNumber && (
 *           <Fields.CaseNumber label="Case number" validationMessages={{ REQUIRED: 'Required' }} />
 *         )}
 *         <Fields.Amount
 *           label="Percentage of paycheck"
 *           validationMessages={{
 *             REQUIRED: 'Required',
 *             PERCENT_OUT_OF_RANGE: 'Must be between 0 and 100',
 *           }}
 *         />
 *         <button type="submit">Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useChildSupportGarnishmentForm({
  employeeId,
  garnishmentId,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseChildSupportGarnishmentFormProps): UseChildSupportGarnishmentFormResult {
  const isCreateMode = !garnishmentId
  const schemaMode = isCreateMode ? 'create' : 'update'

  // Agencies + their required-attributes / fips codes come from a single GET.
  const agencyDataQuery = useGarnishmentsGetChildSupportData({})
  const agencyList = useMemo(
    () => agencyDataQuery.data?.childSupportData?.agencies ?? [],
    [agencyDataQuery.data],
  )

  // Update mode reads the row from the list endpoint (the garnishments API
  // has no single-row GET).
  const garnishmentsListQuery = useGarnishmentsList({ employeeId }, { enabled: !isCreateMode })
  const fetchedDeduction = useMemo(() => {
    if (isCreateMode) return null
    return garnishmentsListQuery.data?.garnishments?.find(g => g.uuid === garnishmentId) ?? null
  }, [isCreateMode, garnishmentId, garnishmentsListQuery.data])

  const resolvedDefaults: ChildSupportGarnishmentFormData = useMemo(
    () => ({
      state: fetchedDeduction?.childSupport?.state ?? partnerDefaults?.state ?? '',
      fipsCode: fetchedDeduction?.childSupport?.fipsCode ?? partnerDefaults?.fipsCode ?? '',
      caseNumber: fetchedDeduction?.childSupport?.caseNumber ?? partnerDefaults?.caseNumber ?? '',
      orderNumber:
        fetchedDeduction?.childSupport?.orderNumber ?? partnerDefaults?.orderNumber ?? '',
      remittanceNumber:
        fetchedDeduction?.childSupport?.remittanceNumber ?? partnerDefaults?.remittanceNumber ?? '',
      amount: fetchedDeduction?.amount
        ? Number(fetchedDeduction.amount)
        : (partnerDefaults?.amount ?? 0),
      payPeriodMaximum: fetchedDeduction?.payPeriodMaximum
        ? Number(fetchedDeduction.payPeriodMaximum)
        : (partnerDefaults?.payPeriodMaximum ?? 0),
      paymentPeriod:
        (fetchedDeduction?.childSupport?.paymentPeriod as PaymentPeriod | undefined) ??
        partnerDefaults?.paymentPeriod ??
        PaymentPeriod.Monthly,
    }),
    [fetchedDeduction, partnerDefaults],
  )

  // Pass the full agency list so requiredness for the agency-attribute fields
  // (`caseNumber`, `orderNumber`, `remittanceNumber`) is derived dynamically
  // from the form's `state` value. The schema doesn't need to rebuild when the
  // user changes states — the predicate runs at validation time and via
  // `useDeriveFieldsMetadata` for the (optional) label.
  const [schema, metadataConfig] = useMemo(
    () => createChildSupportGarnishmentFormSchema({ mode: schemaMode, agencyList }),
    [schemaMode, agencyList],
  )

  const formMethods = useForm<
    ChildSupportGarnishmentFormData,
    unknown,
    ChildSupportGarnishmentFormOutputs
  >({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const liveWatchedState = useWatch({ control: formMethods.control, name: 'state' })
  const liveSelectedAgency = useMemo(
    () => agencyList.find(a => a.state === liveWatchedState) ?? null,
    [agencyList, liveWatchedState],
  )

  // The agency-attribute fields stay in sync with the chosen state: when the
  // user switches states, the previous attribute values would otherwise carry
  // over and potentially submit alongside the wrong agency. The ref tracks
  // the previous value so the wipe only fires on user-driven transitions —
  // NOT on the initial sync when an existing garnishment loads (state moves
  // from '' to e.g. 'AK' as a side effect of `values` updating, which would
  // otherwise clobber the loaded case/order/remittance values).
  const previousWatchedStateRef = useRef<string | null>(null)
  useEffect(() => {
    const previous = previousWatchedStateRef.current
    previousWatchedStateRef.current = liveWatchedState
    // First render (no previous value) → skip the wipe.
    if (previous === null) return
    // Server-side load: previous was '' (initial defaults before the row
    // arrived), now it's the loaded state. That's a sync, not a user toggle.
    if (previous === '') return
    if (previous === liveWatchedState) return
    formMethods.setValue('caseNumber', '')
    formMethods.setValue('orderNumber', '')
    formMethods.setValue('remittanceNumber', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveWatchedState])

  // When the selected agency has a single "all counties" fips code, auto-fill
  // the field so the consumer doesn't have to render the county select.
  const fipsCodes = liveSelectedAgency?.fipsCodes ?? []
  const singleAllCountiesFipsCode =
    fipsCodes.length === 1 && !fipsCodes[0]?.county?.length ? (fipsCodes[0]?.code ?? null) : null
  useEffect(() => {
    if (singleAllCountiesFipsCode) {
      formMethods.setValue('fipsCode', singleAllCountiesFipsCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleAllCountiesFipsCode])

  const createGarnishmentMutation = useGarnishmentsCreateMutation()
  const updateGarnishmentMutation = useGarnishmentsUpdateMutation()
  const isPending = createGarnishmentMutation.isPending || updateGarnishmentMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ChildSupportGarnishmentForm')

  const errorHandling = composeErrorHandler(
    isCreateMode ? [agencyDataQuery] : [agencyDataQuery, garnishmentsListQuery],
    { submitError, setSubmitError },
  )

  // ── Derived data exposed on the ready branch ─────────────────────────

  const agencies: StateFieldEntry[] = useMemo(
    () =>
      agencyList.map(a => ({
        state: a.state ?? '',
        name: a.name ?? a.state ?? '',
        manualPaymentRequired: a.manualPaymentRequired ?? false,
      })),
    [agencyList],
  )

  const counties: CountyEntry[] = useMemo(
    () =>
      (liveSelectedAgency?.fipsCodes ?? [])
        .filter(f => typeof f.code === 'string')
        .map(f => ({ fipsCode: f.code as string, county: f.county ?? null })),
    [liveSelectedAgency],
  )

  const requiredAttrKeys = useMemo(
    () => getRequiredAttrKeys(liveSelectedAgency),
    [liveSelectedAgency],
  )

  const hasSelectableCounties =
    counties.length > 1 || (counties.length === 1 && singleAllCountiesFipsCode == null)

  // ── Metadata + field-options wiring ─────────────────────────────────

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const stateOptions = agencies.map(a => ({ value: a.state, label: a.name }))
  const countyOptions = counties.map(c => ({
    value: c.fipsCode,
    label: c.county ?? c.fipsCode,
  }))

  const fieldsMetadata = buildChildSupportGarnishmentFieldsMetadata(baseMetadata, {
    stateOptions,
    agencies,
    countyOptions,
    counties,
  })

  // ── Submit ───────────────────────────────────────────────────────────

  const onSubmit = async (): Promise<HookSubmitResult<Garnishment> | undefined> => {
    let submitResult: HookSubmitResult<Garnishment> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ChildSupportGarnishmentFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const childSupport = {
              state: payload.state,
              paymentPeriod: payload.paymentPeriod,
              fipsCode: payload.fipsCode,
              // Empty strings collapse to null so the API persists "no value
              // declared" rather than an empty case number.
              caseNumber: payload.caseNumber || null,
              orderNumber: payload.orderNumber || null,
              remittanceNumber: payload.remittanceNumber || null,
            }

            const description = `Child Support - ${childSupport.caseNumber ?? ''}`
            const amountStr = String(payload.amount)
            const payPeriodMaximumStr =
              payload.payPeriodMaximum > 0 ? String(payload.payPeriodMaximum) : null

            const requestBody = {
              active: true,
              amount: amountStr,
              description,
              courtOrdered: true,
              garnishmentType: 'child_support' as GarnishmentType,
              times: null,
              deductAsPercentage: true,
              payPeriodMaximum: payPeriodMaximumStr,
              recurring: true,
              childSupport,
            }

            let updated: Garnishment | undefined

            if (isCreateMode) {
              const result = await createGarnishmentMutation.mutateAsync({
                request: { employeeId, garnishmentRequest: requestBody },
              })
              updated = result.garnishment
            } else {
              if (!fetchedDeduction) {
                throw new SDKInternalError(
                  'Cannot update child-support deduction: no matching garnishment on file',
                )
              }
              const result = await updateGarnishmentMutation.mutateAsync({
                request: {
                  garnishmentId: fetchedDeduction.uuid,
                  updateGarnishmentRequest: {
                    ...requestBody,
                    version: fetchedDeduction.version as string,
                  },
                },
              })
              updated = result.garnishment
            }

            if (!updated) {
              throw new SDKInternalError(
                isCreateMode
                  ? 'Child-support deduction creation failed'
                  : 'Child-support deduction update failed',
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

  if (agencyDataQuery.isLoading) {
    return { isLoading: true as const, errorHandling }
  }
  if (!isCreateMode && garnishmentsListQuery.isLoading) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      agencies,
      counties,
      deduction: fetchedDeduction,
    },
    status: {
      isPending,
      mode: isCreateMode ? 'create' : 'update',
      selectedAgency: liveSelectedAgency,
      isManualPaymentRequired: liveSelectedAgency?.manualPaymentRequired ?? false,
      requiredAttrKeys,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        State: StateField,
        FipsCode: hasSelectableCounties ? FipsCodeField : undefined,
        CaseNumber: requiredAttrKeys.has('case_number') ? CaseNumberField : undefined,
        OrderNumber: requiredAttrKeys.has('order_number') ? OrderNumberField : undefined,
        RemittanceNumber: requiredAttrKeys.has('remittance_number')
          ? RemittanceNumberField
          : undefined,
        PayPeriodMaximum: PayPeriodMaximumField,
        Amount: AmountField,
        PaymentPeriod: PaymentPeriodField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Per-field metadata returned by {@link useChildSupportGarnishmentForm} as `form.fieldsMetadata`.
 *
 * @remarks
 * Carries per-field `isRequired`, `isDisabled`, label, description, and option
 * entries derived from the schema and form state. Use these to drive UI such
 * as disabled state or option lists when not relying on the pre-bound
 * {@link ChildSupportGarnishmentFormFields} components.
 *
 * @public
 */
export type ChildSupportGarnishmentFormFieldsMetadata = ReturnType<
  typeof buildChildSupportGarnishmentFieldsMetadata
>
