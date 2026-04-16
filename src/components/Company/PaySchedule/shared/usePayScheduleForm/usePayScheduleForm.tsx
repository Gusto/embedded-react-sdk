import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PaySchedule } from '@gusto/embedded-api/models/components/payschedule'
import type { PaySchedulePreviewPayPeriod } from '@gusto/embedded-api/models/components/payschedulepreviewpayperiod'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaymentConfigsGet } from '@gusto/embedded-api/react-query/paymentConfigsGet'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
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
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
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

export interface UsePayScheduleFormProps {
  companyId: string
  payScheduleId?: string
  optionalFieldsToRequire?: PayScheduleOptionalFieldsToRequire
  defaultValues?: Partial<PayScheduleFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface UsePayScheduleFormReady extends BaseFormHookReady<
  FieldsMetadata,
  PayScheduleFormData
> {
  data: {
    paySchedule: PaySchedule | null
    payPeriodPreview: PaySchedulePreviewPayPeriod[] | null
    payPreviewLoading: boolean
    paymentSpeedDays: number | null
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<PaySchedule> | undefined>
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

  const currentPaySchedule = payScheduleQuery.data?.paySchedule ?? null
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

  const onSubmit = async (): Promise<HookSubmitResult<PaySchedule> | undefined> => {
    let submitResult: HookSubmitResult<PaySchedule> | undefined

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

              submitResult = { mode: 'create', data: result.paySchedule! }
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

              submitResult = { mode: 'update', data: result.paySchedule! }
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
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UsePayScheduleFormResult = HookLoadingResult | UsePayScheduleFormReady
export type PayScheduleFieldsMetadata = UsePayScheduleFormReady['form']['fieldsMetadata']
export type PayScheduleFormFields = UsePayScheduleFormReady['form']['Fields']
