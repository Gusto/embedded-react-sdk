import { useEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PayScheduleShow } from '@gusto/embedded-api-v-2025-11-15/models/components/payscheduleshow'
import type { PaySchedulePreviewPayPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/payschedulepreviewpayperiod'
import { usePaySchedulesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesGet'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesGetPreview'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesCreate'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesUpdate'
import { usePaymentConfigsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/paymentConfigsGet'
import { RFCDate } from '@gusto/embedded-api-v-2025-11-15/types/rfcdate'
import {
  createPayScheduleSchema,
  type PayScheduleOptionalFieldsToRequire,
  type PayScheduleFormData,
  type PayScheduleFormOutputs,
  type PayScheduleFrequency,
} from './payScheduleSchema'
import {
  CustomNameField,
  FrequencyField,
  CustomTwicePerMonthField,
  AnchorPayDateField,
  AnchorEndOfPayPeriodField,
  Day1Field,
  Day2Field,
} from './fields'
import type {
  CustomNameFieldProps,
  FrequencyFieldProps,
  CustomTwicePerMonthFieldProps,
  AnchorPayDateFieldProps,
  AnchorEndOfPayPeriodFieldProps,
  Day1FieldProps,
  Day2FieldProps,
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
import { parsePaymentSpeedDays } from '@/hooks/useCompanyPaymentSpeed'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

export type { PayScheduleOptionalFieldsToRequire } from './payScheduleSchema'

/**
 * Configuration options for {@link usePayScheduleForm}.
 *
 * @remarks
 * Presence or absence of `payScheduleId` selects between update and create mode.
 *
 * @public
 */
export interface UsePayScheduleFormProps {
  /** UUID of the company that owns the pay schedule. */
  companyId: string
  /**
   * When set, loads that pay schedule and updates it on submit. When omitted,
   * the form is in create mode and creates a new schedule on submit.
   */
  payScheduleId?: string
  /** Override fields that are optional on a given mode to be required. See `PayScheduleOptionalFieldsToRequire`. */
  optionalFieldsToRequire?: PayScheduleOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update. */
  defaultValues?: Partial<PayScheduleFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `usePayScheduleForm().form.Fields`.
 *
 * @remarks
 * `CustomTwicePerMonth`, `Day1`, and `Day2` are conditionally `undefined` based
 * on the selected frequency and twice-per-month strategy — always null-check them
 * before rendering.
 *
 * @public
 */
export interface PayScheduleFormFields {
  /** Bound to `customName`. Display name text input. Always available. */
  CustomName: ComponentType<CustomNameFieldProps>
  /** Bound to `frequency`. Frequency selector. Always available. */
  Frequency: ComponentType<FrequencyFieldProps>
  /** Bound to `customTwicePerMonth`. Twice-per-month strategy radio group. Only available when frequency is `'Twice per month'`. */
  CustomTwicePerMonth: ComponentType<CustomTwicePerMonthFieldProps> | undefined
  /** Bound to `anchorPayDate`. First pay date picker. Always available. */
  AnchorPayDate: ComponentType<AnchorPayDateFieldProps>
  /** Bound to `anchorEndOfPayPeriod`. First pay period end date picker. Always available. */
  AnchorEndOfPayPeriod: ComponentType<AnchorEndOfPayPeriodFieldProps>
  /** Bound to `day1`. First-pay-day-of-month number input. Available when frequency is `'Monthly'`, or `'Twice per month'` with `'custom'` strategy. */
  Day1: ComponentType<Day1FieldProps> | undefined
  /** Bound to `day2`. Last-pay-day-of-month number input. Available when frequency is `'Twice per month'` with `'custom'` strategy. */
  Day2: ComponentType<Day2FieldProps> | undefined
}

/**
 * Ready-state shape returned by {@link usePayScheduleForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with the
 * pay-schedule-specific `data`, `status`, `actions`, and `form.Fields` shape.
 *
 * @public
 */
export interface UsePayScheduleFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PayScheduleFormData,
  PayScheduleFormFields
> {
  /** Static entity data resolved from the API. */
  data: {
    /** The pay schedule loaded for update; `null` in create mode. */
    paySchedule: PayScheduleShow | null
    /** Upcoming pay periods previewed from current form values; `null` until the anchor date fields are complete. */
    payPeriodPreview: PaySchedulePreviewPayPeriod[] | null
    /** `true` while the pay period preview request is in flight. */
    payPreviewLoading: boolean
    /** Business days the company needs to process payroll, derived from payment configs; `null` if unavailable. */
    paymentSpeedDays: number | null
  }
  /** Reactive status flags. */
  status: {
    /** `true` while the create or update mutation is in flight. */
    isPending: boolean
    /** Whether the form is creating a new schedule or updating an existing one. */
    mode: 'create' | 'update'
  }
  /** Available actions. */
  actions: {
    /** Validates the form and dispatches the create or update mutation. Returns the saved schedule, or `undefined` if validation failed. */
    onSubmit: () => Promise<HookSubmitResult<PayScheduleShow> | undefined>
  }
}

const FREQUENCY_OPTIONS: Array<{ value: PayScheduleFrequency; label: string }> = [
  { value: 'Every week', label: 'Every week' },
  { value: 'Every other week', label: 'Every other week' },
  { value: 'Twice per month', label: 'Twice per month' },
  { value: 'Monthly', label: 'Monthly' },
]

const FREQUENCY_ENTRIES: PayScheduleFrequency[] = FREQUENCY_OPTIONS.map(o => o.value)

const TWICE_PER_MONTH_OPTIONS = [
  { value: '1st15th', label: '15th and Last day of the month' },
  { value: 'custom', label: 'Custom' },
]

const TWICE_PER_MONTH_ENTRIES = TWICE_PER_MONTH_OPTIONS.map(o => o.value)

function formatWatchedDate(value: unknown): string {
  if (value instanceof Date) return formatDateToStringDate(value) || ''
  if (typeof value === 'string' && value) return value
  return ''
}

function deriveCustomTwicePerMonth(
  frequency: string | undefined,
  day1: number | undefined,
  day2: number | undefined,
): string {
  if (frequency !== 'Twice per month') return ''
  if (day1 === 15 && day2 === 31) return '1st15th'
  return 'custom'
}

/**
 * Form hook for creating or updating a company pay schedule.
 *
 * @remarks
 * When `payScheduleId` is supplied the hook loads that schedule and issues an
 * update on submit; when omitted it operates in create mode. While both anchor
 * date fields are filled in, the hook fetches a live pay period calendar
 * preview exposed on `data.payPeriodPreview`. `data.paymentSpeedDays` reflects
 * the company's payment configuration and is useful for surfacing UI hints
 * about how far ahead the first pay date must be.
 *
 * @param props - See {@link UsePayScheduleFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UsePayScheduleFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   usePayScheduleForm,
 *   SDKFormProvider,
 *   type UsePayScheduleFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function PaySchedulePage({ companyId }: { companyId: string }) {
 *   const paySchedule = usePayScheduleForm({ companyId })
 *
 *   if (paySchedule.isLoading) return <div>Loading...</div>
 *
 *   return <PayScheduleFormReady paySchedule={paySchedule} />
 * }
 *
 * function PayScheduleFormReady({ paySchedule }: { paySchedule: UsePayScheduleFormReady }) {
 *   const { Fields } = paySchedule.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={paySchedule}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void paySchedule.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.CustomName label="Name" validationMessages={{ REQUIRED: 'Name is required' }} />
 *         <Fields.Frequency label="Frequency" validationMessages={{ REQUIRED: 'Frequency is required' }} />
 *         {Fields.CustomTwicePerMonth && <Fields.CustomTwicePerMonth label="Frequency Options" />}
 *         <Fields.AnchorPayDate label="First pay date" validationMessages={{ REQUIRED: 'Required' }} />
 *         <Fields.AnchorEndOfPayPeriod label="First pay period end" validationMessages={{ REQUIRED: 'Required' }} />
 *         {Fields.Day1 && (
 *           <Fields.Day1
 *             label="First pay day of the month"
 *             validationMessages={{ REQUIRED: 'Required', DAY_RANGE: 'Must be 1–31' }}
 *           />
 *         )}
 *         {Fields.Day2 && (
 *           <Fields.Day2
 *             label="Last pay day of the month"
 *             validationMessages={{ REQUIRED: 'Required', DAY_RANGE: 'Must be 1–31' }}
 *           />
 *         )}
 *         <button type="submit" disabled={paySchedule.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function usePayScheduleForm({
  companyId,
  payScheduleId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UsePayScheduleFormProps): HookLoadingResult | UsePayScheduleFormReady {
  const payScheduleQuery = usePaySchedulesGet(
    { companyId, payScheduleId: payScheduleId ?? '' },
    { enabled: !!payScheduleId },
  )

  const paymentConfigsQuery = usePaymentConfigsGet({ companyUuid: companyId })

  const currentPaySchedule = payScheduleQuery.data?.payScheduleShow ?? null
  const paymentSpeed = paymentConfigsQuery.data?.paymentConfigs?.paymentSpeed
  const paymentSpeedDays = parsePaymentSpeedDays(paymentSpeed)

  const isCreateMode = !currentPaySchedule
  const mode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () => createPayScheduleSchema({ mode, optionalFieldsToRequire }),
    [mode, optionalFieldsToRequire],
  )

  const resolvedDefaults: PayScheduleFormData = {
    customName: currentPaySchedule?.customName ?? partnerDefaults?.customName ?? '',
    frequency: (currentPaySchedule?.frequency ??
      partnerDefaults?.frequency ??
      'Every week') as PayScheduleFrequency,
    customTwicePerMonth: deriveCustomTwicePerMonth(
      currentPaySchedule?.frequency ?? partnerDefaults?.frequency,
      currentPaySchedule?.day1 ?? partnerDefaults?.day1 ?? undefined,
      currentPaySchedule?.day2 ?? partnerDefaults?.day2 ?? undefined,
    ),
    anchorPayDate:
      currentPaySchedule?.anchorPayDate?.toString() ?? partnerDefaults?.anchorPayDate ?? null,
    anchorEndOfPayPeriod:
      currentPaySchedule?.anchorEndOfPayPeriod?.toString() ??
      partnerDefaults?.anchorEndOfPayPeriod ??
      null,
    day1: currentPaySchedule?.day1 ?? partnerDefaults?.day1 ?? NaN,
    day2: currentPaySchedule?.day2 ?? partnerDefaults?.day2 ?? NaN,
  }

  const formMethods = useForm<PayScheduleFormData, unknown, PayScheduleFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const watchedFrequency = useWatch({ control: formMethods.control, name: 'frequency' })
  const watchedCustomTwicePerMonth = useWatch({
    control: formMethods.control,
    name: 'customTwicePerMonth',
  })
  const watchedAnchorPayDate = useWatch({ control: formMethods.control, name: 'anchorPayDate' })
  const watchedAnchorEndOfPayPeriod = useWatch({
    control: formMethods.control,
    name: 'anchorEndOfPayPeriod',
  })
  const watchedDay1 = useWatch({ control: formMethods.control, name: 'day1' })
  const watchedDay2 = useWatch({ control: formMethods.control, name: 'day2' })

  useEffect(() => {
    if (watchedFrequency === 'Twice per month' && watchedCustomTwicePerMonth === '1st15th') {
      formMethods.setValue('day1', 15)
      formMethods.setValue('day2', 31)
    }
  }, [watchedFrequency, watchedCustomTwicePerMonth, formMethods.setValue])

  const formattedAnchorPayDate = formatWatchedDate(watchedAnchorPayDate)
  const formattedAnchorEndOfPayPeriod = formatWatchedDate(watchedAnchorEndOfPayPeriod)

  const previewEnabled = Boolean(formattedAnchorPayDate && formattedAnchorEndOfPayPeriod)

  const previewQuery = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: watchedFrequency,
      ...(formattedAnchorPayDate && { anchorPayDate: new RFCDate(formattedAnchorPayDate) }),
      ...(formattedAnchorEndOfPayPeriod && {
        anchorEndOfPayPeriod: new RFCDate(formattedAnchorEndOfPayPeriod),
      }),
      day1: watchedDay1 || undefined,
      day2: watchedDay2 || undefined,
    } as Parameters<typeof usePaySchedulesGetPreview>[0],
    { enabled: previewEnabled },
  )

  const payPeriodPreview: PaySchedulePreviewPayPeriod[] | undefined =
    previewQuery.data?.paySchedulePreview?.payPeriods
  const payPreviewLoading = previewQuery.isLoading && previewEnabled

  const createPayScheduleMutation = usePaySchedulesCreateMutation()
  const updatePayScheduleMutation = usePaySchedulesUpdateMutation()

  const isPending = createPayScheduleMutation.isPending || updatePayScheduleMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PayScheduleForm')

  const queries = payScheduleId ? [payScheduleQuery, paymentConfigsQuery] : [paymentConfigsQuery]
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const showCustomTwicePerMonth = watchedFrequency === 'Twice per month'
  const showDay1 =
    watchedFrequency === 'Monthly' ||
    (watchedFrequency === 'Twice per month' && watchedCustomTwicePerMonth === 'custom')
  const showDay2 = watchedFrequency === 'Twice per month' && watchedCustomTwicePerMonth === 'custom'

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    customName: baseMetadata.customName,
    frequency: withOptions<PayScheduleFrequency>(
      baseMetadata.frequency,
      FREQUENCY_OPTIONS,
      FREQUENCY_ENTRIES,
    ),
    customTwicePerMonth: withOptions<string>(
      baseMetadata.customTwicePerMonth,
      TWICE_PER_MONTH_OPTIONS,
      TWICE_PER_MONTH_ENTRIES,
    ),
    anchorPayDate: baseMetadata.anchorPayDate,
    anchorEndOfPayPeriod: baseMetadata.anchorEndOfPayPeriod,
    day1: baseMetadata.day1,
    day2: baseMetadata.day2,
  }

  const onSubmit = async (): Promise<HookSubmitResult<PayScheduleShow> | undefined> => {
    let submitResult: HookSubmitResult<PayScheduleShow> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: PayScheduleFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const anchorPayDate = payload.anchorPayDate ?? ''
            const anchorEndOfPayPeriod = payload.anchorEndOfPayPeriod ?? ''

            if (isCreateMode) {
              const result = await createPayScheduleMutation.mutateAsync({
                request: {
                  companyId,
                  payScheduleCreateRequest: {
                    frequency: payload.frequency,
                    anchorPayDate: new RFCDate(anchorPayDate),
                    anchorEndOfPayPeriod: new RFCDate(anchorEndOfPayPeriod),
                    customName: payload.customName,
                    day1: payload.day1 || undefined,
                    day2: payload.day2 || undefined,
                  },
                },
              })

              submitResult = { mode: 'create', data: result.payScheduleShow! }
            } else {
              const result = await updatePayScheduleMutation.mutateAsync({
                request: {
                  payScheduleId: currentPaySchedule.uuid,
                  companyId,
                  payScheduleUpdateRequest: {
                    frequency: payload.frequency,
                    anchorPayDate: new RFCDate(anchorPayDate),
                    anchorEndOfPayPeriod: new RFCDate(anchorEndOfPayPeriod),
                    customName: payload.customName,
                    day1: payload.day1 || undefined,
                    day2: payload.day2 || undefined,
                    version: currentPaySchedule.version!,
                  },
                },
              })

              submitResult = { mode: 'update', data: result.payScheduleShow! }
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

  const isDataLoading =
    paymentConfigsQuery.isLoading || (payScheduleId ? payScheduleQuery.isLoading : false)

  if (isDataLoading) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      paySchedule: currentPaySchedule,
      payPeriodPreview: payPeriodPreview ?? null,
      payPreviewLoading,
      paymentSpeedDays,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        CustomName: CustomNameField,
        Frequency: FrequencyField,
        CustomTwicePerMonth: showCustomTwicePerMonth ? CustomTwicePerMonthField : undefined,
        AnchorPayDate: AnchorPayDateField,
        AnchorEndOfPayPeriod: AnchorEndOfPayPeriodField,
        Day1: showDay1 ? Day1Field : undefined,
        Day2: showDay2 ? Day2Field : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link usePayScheduleForm}.
 *
 * @public
 */
export type UsePayScheduleFormResult = HookLoadingResult | UsePayScheduleFormReady
/**
 * Type of `form.fieldsMetadata` returned by {@link usePayScheduleForm}.
 *
 * @public
 */
export type PayScheduleFieldsMetadata = UsePayScheduleFormReady['form']['fieldsMetadata']
