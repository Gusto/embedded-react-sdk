import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import {
  usePaySchedulesGetAllSuspense,
  invalidateAllPaySchedulesGetAll,
} from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import type { PayScheduleObject as PayScheduleType } from '@gusto/embedded-api/models/components/payscheduleobject'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import type { Frequency } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayschedules'
import type { MODE, PayScheduleInputs, PayScheduleOutputs } from './usePaySchedule'
import {
  PayScheduleProvider,
  PayScheduleSchema,
  type PayScheduleDefaultValues,
} from './usePaySchedule'
import { Actions, Edit, Head, List } from './_parts'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { formateDateToStringDate } from '@/helpers/dateFormatting'

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
  const queryClient = useQueryClient()
  const { baseSubmitHandler, onEvent, fieldErrors } = useBase()
  const [mode, setMode] = useState<MODE>('LIST_PAY_SCHEDULES')
  const [currentPaySchedule, setCurrentPaySchedule] = useState<PayScheduleType | null>(null)
  const transformedDefaultValues: PayScheduleInputs = {
    frequency: defaultValues?.frequency ?? 'Every week',
    anchorPayDate: defaultValues?.anchorPayDate ? new Date(defaultValues.anchorPayDate) : undefined,
    anchorEndOfPayPeriod: defaultValues?.anchorEndOfPayPeriod
      ? new Date(defaultValues.anchorEndOfPayPeriod)
      : undefined,
    day1: defaultValues?.day1 ?? undefined,
    day2: defaultValues?.day2 ?? undefined,
    customName: defaultValues?.customName ?? '',
    customTwicePerMonth: 'false',
    payPeriodPreviewRange: 0,
  }

  const [payScheduleDraft, setPayScheduleDraft] = useState<PayScheduleType | null>(null)
  const { data: payPreviewData, isLoading } = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: payScheduleDraft?.frequency as Frequency,
      anchorPayDate: payScheduleDraft?.anchorPayDate ?? '',
      anchorEndOfPayPeriod: payScheduleDraft?.anchorEndOfPayPeriod ?? '',
      day1: payScheduleDraft?.day1 ?? undefined,
      day2: payScheduleDraft?.day2 ?? undefined,
    },
    {
      enabled: true,
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
  const { watch, setValue, reset, setError } = formMethods

  useEffect(() => {
    if (fieldErrors) {
      // TODO: These error messages are not being localized correctly
      fieldErrors.forEach(error => {
        setError(error.key as keyof PayScheduleInputs, { message: error.message })
      })
    }
  }, [setError, fieldErrors])

  const allValues = watch()

  // Set the custom_twice_per_month value based on the frequency and day_1 and day_2 values as it is not set by the API call
  useEffect(() => {
    if (
      allValues.frequency === 'Twice per month' &&
      allValues.day1 === 15 &&
      allValues.day2 === 31 &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', `1st15th`)
    } else if (
      allValues.frequency === 'Twice per month' &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', `custom`)
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
      version: currentPaySchedule?.version || '', //TODO: This needs to be set to something
    })
  }, [
    allValues.anchorEndOfPayPeriod,
    allValues.anchorPayDate,
    allValues.day1,
    allValues.day2,
    allValues.frequency,
    currentPaySchedule?.version,
    setPayScheduleDraft,
  ])

  // Custom effect to show/hide pay schedule preview errors

  const handleAdd = () => {
    setMode('ADD_PAY_SCHEDULE')
    reset({})
  }
  const handleCancel = () => {
    setMode('LIST_PAY_SCHEDULES')
    reset({})
    setPayScheduleDraft(null)
  }
  const handleEdit = (schedule: PayScheduleType) => {
    reset({
      frequency: schedule.frequency as Frequency,
      anchorPayDate: schedule.anchorPayDate ? new Date(schedule.anchorPayDate) : undefined,
      anchorEndOfPayPeriod: schedule.anchorEndOfPayPeriod
        ? new Date(schedule.anchorEndOfPayPeriod)
        : undefined,
      day1: schedule.day1 ?? undefined,
      day2: schedule.day2 ?? undefined,
      customName: schedule.customName ?? '',
    })
    setCurrentPaySchedule(schedule)
    setMode('EDIT_PAY_SCHEDULE')
  }

  const onSubmit: SubmitHandler<PayScheduleOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const formatPayloadDate = (date: Date | undefined): string => {
        return date ? formateDateToStringDate(date) || '' : ''
      }

      if (mode === 'ADD_PAY_SCHEDULE') {
        const createPayScheduleResponse = await createPayScheduleMutation.mutateAsync({
          request: {
            companyId: companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: formatPayloadDate(payload.anchorPayDate),
              anchorEndOfPayPeriod: formatPayloadDate(payload.anchorEndOfPayPeriod),
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
        const version = currentPaySchedule?.version
        const updatePayScheduleResponse = await updatePayScheduleMutation.mutateAsync({
          request: {
            payScheduleId: currentPaySchedule?.uuid as string,
            companyId: companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: formatPayloadDate(payload.anchorPayDate),
              anchorEndOfPayPeriod: formatPayloadDate(payload.anchorEndOfPayPeriod),
              customName: payload.customName,
              day1: payload.day1,
              day2: payload.day2,
              version: version as string,
            },
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_UPDATED, updatePayScheduleResponse)
        reset()
        setPayScheduleDraft(null)
      }
      await invalidateAllPaySchedulesGetAll(queryClient)
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
        paySchedules: paySchedules.payScheduleList,
        payPeriodPreview: payPreviewData?.object?.payPeriods,
        payPreviewLoading: isLoading,
        currentPaySchedule,
      }}
    >
      <span data-testid="pay-schedule-edit-form">
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
      </span>
    </PayScheduleProvider>
  )
}

PaySchedule.Head = Head
PaySchedule.List = List
PaySchedule.Edit = Edit
PaySchedule.Actions = Actions
