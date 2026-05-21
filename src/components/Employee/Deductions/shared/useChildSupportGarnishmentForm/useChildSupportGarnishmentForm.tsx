import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type Garnishment,
  type GarnishmentType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { Agencies } from '@gusto/embedded-api-v-2025-11-15/models/components/childsupportdata'
import { PaymentPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishmentchildsupport'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsUpdate'
import { useGarnishmentsList } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsList'
import { useGarnishmentsGetChildSupportData } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsGetChildSupportData'
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

export interface UseChildSupportGarnishmentFormProps {
  employeeId: string
  /**
   * When set, loads that garnishment via the list query and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  garnishmentId?: string
  defaultValues?: Partial<ChildSupportGarnishmentFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface ChildSupportGarnishmentFormFields {
  State: typeof StateField
  /** Only available when the selected agency has more than one fips code, or the
   *  sole code is county-scoped (not an "all counties" auto-pick). */
  FipsCode: typeof FipsCodeField | undefined
  /** Only available when the selected agency requires `case_number`. */
  CaseNumber: typeof CaseNumberField | undefined
  /** Only available when the selected agency requires `order_number`. */
  OrderNumber: typeof OrderNumberField | undefined
  /** Only available when the selected agency requires `remittance_number`. */
  RemittanceNumber: typeof RemittanceNumberField | undefined
  PayPeriodMaximum: typeof PayPeriodMaximumField
  Amount: typeof AmountField
  PaymentPeriod: typeof PaymentPeriodField
}

export interface UseChildSupportGarnishmentFormReady extends BaseFormHookReady<
  FieldsMetadata,
  ChildSupportGarnishmentFormData,
  ChildSupportGarnishmentFormFields
> {
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
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /** The agency record matching the currently selected `state`. */
    selectedAgency: Agencies | null
    /** Mirrors `selectedAgency.manualPaymentRequired`; convenient for showing
     *  a warning alert. */
    isManualPaymentRequired: boolean
    /** Which `required_attributes` keys the selected agency declares. */
    requiredAttrKeys: ReadonlySet<SupportedRequiredAttrKey>
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
}

export type UseChildSupportGarnishmentFormResult =
  | HookLoadingResult
  | UseChildSupportGarnishmentFormReady

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

  // The schema is built statically here. The agency-attribute fields
  // (`caseNumber`, `orderNumber`, `remittanceNumber`) are kept optional in the
  // schema and surfaced as `isRequired` at the metadata level when the
  // selected agency declares them in `required_attributes`. This matches the
  // legacy ChildSupportForm, which also used a static schema and relied on the
  // API to enforce missing-attribute validation. The hook's `requiredAttrKeys`
  // status flag tells consumers which UI fields to mark required.
  const [schema, metadataConfig] = useMemo(
    () => createChildSupportGarnishmentFormSchema({ mode: schemaMode }),
    [schemaMode],
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

  const fieldsMetadata = {
    state: withOptions(baseMetadata.state, stateOptions, agencies),
    fipsCode: withOptions(baseMetadata.fipsCode, countyOptions, counties),
    caseNumber: baseMetadata.caseNumber,
    orderNumber: baseMetadata.orderNumber,
    remittanceNumber: baseMetadata.remittanceNumber,
    payPeriodMaximum: baseMetadata.payPeriodMaximum,
    amount: baseMetadata.amount,
    paymentPeriod: withOptions(
      baseMetadata.paymentPeriod,
      [...PAYMENT_PERIOD_OPTIONS],
      [...PAYMENT_PERIOD_ENTRIES],
    ),
  }

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

export type ChildSupportGarnishmentFormFieldsMetadata =
  UseChildSupportGarnishmentFormReady['form']['fieldsMetadata']
export type ChildSupportGarnishmentFormFieldsType =
  UseChildSupportGarnishmentFormReady['form']['Fields']
