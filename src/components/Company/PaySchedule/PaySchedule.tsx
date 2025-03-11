import * as v from 'valibot'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import { CalendarDate, parseDate } from '@internationalized/date'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import type { PaySchedule as PayScheduleType } from '@gusto/embedded-api/models/components/payschedule.js'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod.js'
import { QueryParamFrequency } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview.js'
import { Actions, Edit, Head, List } from './_parts'
import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base'
import { Flex } from '@/components/Common'
import { RequireAtLeastOne } from '@/types/Helpers'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type MODE = 'LIST_PAY_SCHEDULES' | 'ADD_PAY_SCHEDULE' | 'EDIT_PAY_SCHEDULE' | 'PREVIEW_PAY_SCHEDULE'

type PayScheduleContextType = {
  companyId: string
  handleAdd: () => void
  handleEdit: (schedule: PayScheduleType) => void
  handleCancel: () => void
  mode: MODE
  paySchedules: PayScheduleType[] | undefined | null
  currentPaySchedule: PayScheduleType | undefined | null
  payPeriodPreview?: PayPeriod[]

  payPreviewLoading?: boolean
}

type PayScheduleFrequency = 'Every week' | 'Every other week' | 'Twice per month' | 'Monthly'

const PayScheduleSchema = v.object({
  frequency: v.union([
    v.literal('Every week'),
    v.literal('Every other week'),
    v.literal('Twice per month'),
    v.literal('Monthly'),
  ]),
  anchorPayDate: v.optional(
    v.pipe(
      v.instance(CalendarDate),
      v.transform(input => input.toString()),
    ),
  ),
  anchorEndOfPayPeriod: v.optional(
    v.pipe(
      v.instance(CalendarDate),
      v.transform(input => input.toString()),
    ),
  ),
  day1: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  day2: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  customName: v.optional(v.string()),
  customTwicePerMonth: v.optional(v.string()),
})

export type PayScheduleInputs = v.InferInput<typeof PayScheduleSchema>
export type PayScheduleOutputs = v.InferOutput<typeof PayScheduleSchema>

export type PayScheduleDefaultValues = RequireAtLeastOne<
  Partial<
    Pick<
      PayScheduleType,
      'anchorPayDate' | 'anchorEndOfPayPeriod' | 'day1' | 'day2' | 'customName' | 'frequency'
    > & {
      frequency: QueryParamFrequency
    }
  >
>

const [usePaySchedule, PayScheduleProvider] =
  createCompoundContext<PayScheduleContextType>('PayScheduleContext')
export { usePaySchedule }

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
  const [currentPaySchedule, setCurrentPaySchedule] = useState<PayScheduleType | null>(null)
  const transformedDefaultValues: PayScheduleInputs = {
    frequency: defaultValues?.frequency ?? 'Every week',
    anchorPayDate: defaultValues?.anchorPayDate
      ? parseDate(defaultValues.anchorPayDate)
      : undefined,
    anchorEndOfPayPeriod: defaultValues?.anchorEndOfPayPeriod
      ? parseDate(defaultValues.anchorEndOfPayPeriod)
      : undefined,
    day1: defaultValues?.day1 ?? undefined,
    day2: defaultValues?.day2 ?? undefined,
    customName: defaultValues?.customName ?? '',
    customTwicePerMonth: 'false',
  }

  const [payScheduleDraft, setPayScheduleDraft] = useState<PayScheduleType | null>(null)
  const {
    data: payPreviewData,
    error: paySchedulePreviewError,
    isLoading,
  } = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: payScheduleDraft?.frequency as QueryParamFrequency,
      anchorPayDate: payScheduleDraft?.anchorPayDate ?? '',
      anchorEndOfPayPeriod: payScheduleDraft?.anchorEndOfPayPeriod ?? '',
      day1: payScheduleDraft?.day1 ?? undefined,
      day2: payScheduleDraft?.day2 ?? undefined,
    },
    {
      enabled: !!payScheduleDraft,
    }, // Casting to non-null because we know it's not null from the enabled prop
  )

  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId,
  })

  const createPayScheduleMutation = usePaySchedulesCreateMutation()
  const updatePayScheduleMutation = usePaySchedulesUpdateMutation()

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
      allValues.day1 === 15 &&
      allValues.day2 === 31 &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', `false`)
    } else if (
      allValues.frequency === 'Twice per month' &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', `true`)
    }
  }, [allValues.frequency, allValues.day1, allValues.day2, setValue, allValues.customTwicePerMonth])

  useEffect(() => {
    // Don't update if dates are not set
    if (!allValues.anchorPayDate || !allValues.anchorEndOfPayPeriod) {
      return
    }

    setPayScheduleDraft({
      frequency: allValues.frequency,
      anchorPayDate: allValues.anchorPayDate.toString(),
      anchorEndOfPayPeriod: allValues.anchorEndOfPayPeriod.toString(),
      day1: allValues.day1 || undefined,
      day2: allValues.day2 || undefined,
      uuid: '',
    })
  }, [
    allValues.anchorEndOfPayPeriod,
    allValues.anchorPayDate,
    allValues.day1,
    allValues.day2,
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
  const handleEdit = (schedule: PayScheduleType) => {
    reset({
      frequency: schedule.frequency as PayScheduleFrequency,
      anchorPayDate: parseDate(schedule.anchorPayDate as string),
      anchorEndOfPayPeriod: parseDate(schedule.anchorEndOfPayPeriod as string),
      day1: schedule.day1 ?? undefined,
      day2: schedule.day2 ?? undefined,
      customName: schedule.customName ?? '',
    })
    setCurrentPaySchedule(schedule)
    setMode('EDIT_PAY_SCHEDULE')
  }

  const onSubmit: SubmitHandler<PayScheduleOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      if (mode === 'ADD_PAY_SCHEDULE') {
        const createPayScheduleResponse = await createPayScheduleMutation.mutateAsync({
          request: {
            companyId: companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: payload.anchorPayDate as string,
              anchorEndOfPayPeriod: payload.anchorEndOfPayPeriod as string,
              customName: payload.customName,
              day1: payload.day1,
              day2: payload.day2,
            },
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_CREATED, createPayScheduleResponse)
        reset()
        setPayScheduleDraft(null)
      } else if (mode === 'EDIT_PAY_SCHEDULE') {
        const updatePayScheduleResponse = await updatePayScheduleMutation.mutateAsync({
          request: {
            payScheduleId: currentPaySchedule?.uuid as string,
            companyId: companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: payload.anchorPayDate,
              anchorEndOfPayPeriod: payload.anchorEndOfPayPeriod,
              customName: payload.customName,
              day1: payload.day1,
              day2: payload.day2,
              version: '', //currentPaySchedule?.version,
            },
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
        paySchedules: paySchedules?.payScheduleList,
        payPeriodPreview: payPreviewData?.object?.payPeriods,
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
