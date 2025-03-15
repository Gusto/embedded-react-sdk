import * as v from 'valibot'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import { CalendarDate, parseDate } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import { Actions, Edit, Head, List } from './_parts'
import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import { Operations, operations, Schemas } from '@/types/schema'
import { RequireAtLeastOne } from '@/types/Helpers'
import {
  useCreatePaySchedule,
  useGetAllPaySchedules,
  useUpdatePaySchedule,
} from '@/api/queries/payschedule'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useGustoApi } from '@/api/context'
import { ApiError } from '@/api/queries/helpers'

type MODE = 'LIST_PAY_SCHEDULES' | 'ADD_PAY_SCHEDULE' | 'EDIT_PAY_SCHEDULE' | 'PREVIEW_PAY_SCHEDULE'

type PaySchedulePreviewDraft =
  operations['get-v1-companies-company_id-pay_schedules-preview']['parameters']['query']

type PayScheduleContextType = {
  companyId: string
  handleAdd: () => void
  handleEdit: (schedule: Schemas['Pay-Schedule']) => void
  handleCancel: () => void
  mode: MODE
  paySchedules: Schemas['Pay-Schedule'][] | null
  currentPaySchedule:
    | (Schemas['Pay-Schedule'] & {
        version?: string
      })
    | null
  payPeriodPreview?: {
    check_date?: string
    end_date?: string
    start_date?: string
    run_payroll_by?: string
  }[]

  payPreviewLoading?: boolean
}

const PayScheduleSchema = v.object({
  frequency: v.union([
    v.literal('Every week'),
    v.literal('Every other week'),
    v.literal('Twice per month'),
    v.literal('Monthly'),
    v.literal('Quarterly'),
    v.literal('Annually'),
  ]),
  anchor_pay_date: v.optional(
    v.pipe(
      v.instance(CalendarDate),
      v.transform(input => input.toString()),
    ),
  ),
  anchor_end_of_pay_period: v.optional(
    v.pipe(
      v.instance(CalendarDate),
      v.transform(input => input.toString()),
    ),
  ),
  day_1: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  day_2: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  custom_name: v.optional(v.string()),
  auto_pilot: v.optional(v.string()),
  custom_twice_per_month: v.optional(v.string()),
  pay_period_preview_range: v.optional(v.number()),
})

export type PayScheduleInputs = v.InferInput<typeof PayScheduleSchema>
export type PayScheduleOutputs = v.InferOutput<typeof PayScheduleSchema>

export type PayScheduleDefaultValues = RequireAtLeastOne<
  Partial<
    Pick<
      Schemas['Pay-Schedule'],
      | 'anchor_pay_date'
      | 'anchor_end_of_pay_period'
      | 'day_1'
      | 'day_2'
      | 'custom_name'
      | 'auto_pilot'
    >
  > & {
    frequency: 'Every week' | 'Every other week' | 'Twice per month' | 'Monthly'
  }
>

const [usePaySchedule, PayScheduleProvider] =
  createCompoundContext<PayScheduleContextType>('PayScheduleContext')
export { usePaySchedule }

// This function to get the pay schedule preview is used to dynamically update a pay schedule preview
// It was removed from the client to avoid issues with retrieving the errors to assist a user in getting a valid
// preview when editing a pay schedule.
export function useGetPaySchedulePreview(
  company_id: string,
  params: Operations['get-v1-companies-company_id-pay_schedules-preview']['parameters']['query'],
  enabled = false,
) {
  const { GustoClient: client } = useGustoApi()
  return useQuery({
    queryKey: ['companies', company_id, 'pay_schedules', 'preview', params],
    queryFn: async () => {
      try {
        return await client.getPaySchedulePreview(company_id, params)
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(
            JSON.stringify({
              message: err.message,
              status: err.statusCode,
              payload: err.errorList,
            }),
          )
        }
      }
    },
    enabled,
    retry: 0, // Disable retries
  })
}

interface PayScheduleProps extends CommonComponentInterface {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export const PaySchedule = ({
  companyId,
  defaultValues,
  ...props
}: PayScheduleProps & BaseComponentInterface) => {
  useI18n('Company.PaySchedule')
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} defaultValues={defaultValues}>
        {props.children}
      </Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, children, defaultValues }: PayScheduleProps) => {
  const { baseSubmitHandler, onEvent } = useBase()
  const [mode, setMode] = useState<MODE>('LIST_PAY_SCHEDULES')
  const [currentPaySchedule, setCurrentPaySchedule] = useState<
    (Schemas['Pay-Schedule'] & { version?: string }) | null
  >(null)
  const transformedDefaultValues: PayScheduleInputs = {
    frequency: defaultValues?.frequency ?? 'Every week',
    anchor_pay_date: defaultValues?.anchor_pay_date
      ? parseDate(defaultValues.anchor_pay_date)
      : undefined,
    anchor_end_of_pay_period: defaultValues?.anchor_end_of_pay_period
      ? parseDate(defaultValues.anchor_end_of_pay_period)
      : undefined,
    day_1: defaultValues?.day_1 ?? undefined,
    day_2: defaultValues?.day_2 ?? undefined,
    custom_name: defaultValues?.custom_name ?? '',
    auto_pilot: defaultValues?.auto_pilot?.toString() ?? '',
    custom_twice_per_month: 'false',
    pay_period_preview_range: 0,
  }

  const [payScheduleDraft, setPayScheduleDraft] = useState<PaySchedulePreviewDraft | null>(null)
  const {
    data: payPreviewData,
    error: paySchedulePreviewError,
    isLoading,
  } = useGetPaySchedulePreview(
    companyId,
    payScheduleDraft as PaySchedulePreviewDraft, // Casting to non-null because we know it's not null from the enabled prop
    !!payScheduleDraft,
  )

  const { data: paySchedules } = useGetAllPaySchedules(companyId)

  const createPayScheduleMutation = useCreatePaySchedule()
  const updatePayScheduleMutation = useUpdatePaySchedule()

  const formMethods = useForm<PayScheduleInputs, unknown, PayScheduleOutputs>({
    resolver: valibotResolver(PayScheduleSchema),
    defaultValues: transformedDefaultValues,
  })
  const { watch, setValue, setError, clearErrors, reset } = formMethods

  const allValues = watch()

  // Set the custom_twice_per_month value based on the frequency and day_1 and day_2 values as it is not set by the API call
  useEffect(() => {
    if (
      allValues.frequency === 'Twice per month' &&
      allValues.day_1 === 15 &&
      allValues.day_2 === 31 &&
      allValues.custom_twice_per_month === undefined
    ) {
      setValue('custom_twice_per_month', `false`)
    } else if (
      allValues.frequency === 'Twice per month' &&
      allValues.custom_twice_per_month === undefined
    ) {
      setValue('custom_twice_per_month', `true`)
    }
  }, [
    allValues.frequency,
    allValues.day_1,
    allValues.day_2,
    setValue,
    allValues.custom_twice_per_month,
  ])

  useEffect(() => {
    // Don't update if dates are not set
    if (!allValues.anchor_pay_date || !allValues.anchor_end_of_pay_period) {
      return
    }

    setPayScheduleDraft({
      frequency: allValues.frequency as PaySchedulePreviewDraft['frequency'],
      anchor_pay_date: allValues.anchor_pay_date.toString(),
      anchor_end_of_pay_period: allValues.anchor_end_of_pay_period.toString(),
      day_1: allValues.day_1 || undefined,
      day_2: allValues.day_2 || undefined,
    })
  }, [
    allValues.anchor_end_of_pay_period,
    allValues.anchor_pay_date,
    allValues.day_1,
    allValues.day_2,
    allValues.frequency,
    setPayScheduleDraft,
  ])

  // Custom effect to show/hide pay schedule preview errors
  useEffect(() => {
    if (paySchedulePreviewError?.message) {
      const errors: {
        payload: {
          error_key: string
          message: string
        }[]
      } = JSON.parse(paySchedulePreviewError.message)
      const errorsList = errors.payload

      errorsList.forEach(error => {
        setError(error.error_key as keyof PayScheduleInputs, { message: error.message })
      })
    } else {
      clearErrors()
    }
  }, [setError, clearErrors, paySchedulePreviewError])

  const handleAdd = () => {
    setMode('ADD_PAY_SCHEDULE')
  }
  const handleCancel = () => {
    setMode('LIST_PAY_SCHEDULES')
    reset()
    setPayScheduleDraft(null)
  }
  const handleEdit = (schedule: Schemas['Pay-Schedule']) => {
    reset({
      frequency: schedule.frequency,
      anchor_pay_date: parseDate(schedule.anchor_pay_date as string),
      anchor_end_of_pay_period: parseDate(schedule.anchor_end_of_pay_period as string),
      day_1: schedule.day_1 ?? undefined,
      day_2: schedule.day_2 ?? undefined,
      custom_name: schedule.custom_name ?? '',
      auto_pilot: schedule.auto_pilot?.toString() ?? '',
    })
    setCurrentPaySchedule(schedule)
    setMode('EDIT_PAY_SCHEDULE')
  }

  const onSubmit: SubmitHandler<PayScheduleOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      if (mode === 'ADD_PAY_SCHEDULE') {
        const createPayScheduleResponse = await createPayScheduleMutation.mutateAsync({
          company_id: companyId,
          body: {
            frequency: payload.frequency as PaySchedulePreviewDraft['frequency'],
            anchor_pay_date: payload.anchor_pay_date as string,
            anchor_end_of_pay_period: payload.anchor_end_of_pay_period as string,
            custom_name: payload.custom_name,
            day_1: payload.day_1,
            day_2: payload.day_2,
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_CREATED, createPayScheduleResponse)
        reset()
        setPayScheduleDraft(null)
      } else if (mode === 'EDIT_PAY_SCHEDULE') {
        const updatePayScheduleResponse = await updatePayScheduleMutation.mutateAsync({
          company_id: companyId,
          pay_schedule_id: currentPaySchedule?.uuid as string,
          body: {
            version: currentPaySchedule?.version as string,
            frequency: payload.frequency as PaySchedulePreviewDraft['frequency'],
            anchor_pay_date: payload.anchor_pay_date,
            anchor_end_of_pay_period: payload.anchor_end_of_pay_period,
            custom_name: payload.custom_name,
            day_1: payload.day_1,
            day_2: payload.day_2,
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_UPDATED, updatePayScheduleResponse)
        reset()
        setPayScheduleDraft(null)
      }
      setMode('LIST_PAY_SCHEDULES')
    })
  }

  return (
    <PayScheduleProvider
      value={{
        companyId,
        handleAdd,
        handleEdit,
        handleCancel,
        mode,
        paySchedules,
        payPeriodPreview: payPreviewData?.pay_periods,
        payPreviewLoading: isLoading,
        currentPaySchedule,
      }}
    >
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {children ? (
            children
          ) : (
            <Flex flexDirection="column">
              <Head />
              <List />
              <Edit />
              <Actions />
            </Flex>
          )}
        </Form>
      </FormProvider>
    </PayScheduleProvider>
  )
}

PaySchedule.Head = Head
PaySchedule.List = List
PaySchedule.Edit = Edit
PaySchedule.Actions = Actions
