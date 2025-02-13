import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import * as v from 'valibot'
import { operations, Schemas } from '@/types/schema'
import { RequireAtLeastOne } from '@/types/Helpers'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo, useState } from 'react'
import {
  useCreatePaySchedule,
  useGetAllPaySchedules,
  useGetPaySchedulePreview,
  useUpdatePaySchedule,
} from '@/api/queries/payschedule'
import { Form } from 'react-aria-components'
import { useI18n } from '@/i18n'
import { CalendarDate, parseDate } from '@internationalized/date'
import { componentEvents } from '@/shared/constants'
import { Actions, Edit, Head, List } from './_parts'

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

interface PayScheduleProps extends CommonComponentInterface {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export const PaySchedule = (props: PayScheduleProps & BaseComponentInterface) => {
  useI18n('Company.PaySchedule')
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, children, defaultValues }: PayScheduleProps) => {
  const { baseSubmitHandler, onEvent } = useBase()
  const [mode, setMode] = useState<MODE>('LIST_PAY_SCHEDULES')
  const [currentPaySchedule, setCurrentPaySchedule] = useState<
    (Schemas['Pay-Schedule'] & { version?: string }) | null
  >(null)
  const transformedDefaultValues: PayScheduleInputs = useMemo(() => {
    return {
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
    }
  }, [defaultValues])

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

  const allValues = formMethods.watch()

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
        formMethods.setError(error.error_key as keyof PayScheduleInputs, { message: error.message })
      })
    } else {
      formMethods.clearErrors()
    }
  }, [formMethods, paySchedulePreviewError])

  const handleAdd = () => {
    setMode('ADD_PAY_SCHEDULE')
  }
  const handleCancel = () => {
    setMode('LIST_PAY_SCHEDULES')
    formMethods.reset()
    setPayScheduleDraft(null)
  }
  const handleEdit = (schedule: Schemas['Pay-Schedule']) => {
    formMethods.reset({
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
        formMethods.reset()
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
        formMethods.reset()
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
