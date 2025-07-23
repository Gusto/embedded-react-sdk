import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import type { PayScheduleObject as PayScheduleType } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Frequency } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayschedules'
import type { MODE, PayScheduleInputs, PayScheduleOutputs } from './usePaySchedule'
import {
  PayScheduleProvider,
  PayScheduleSchema,
  type PayScheduleDefaultValues,
} from './usePaySchedule'
import { Actions, Edit, Head, List } from './_parts'
import { Form } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { useComponentDictionary } from '@/i18n/I18n'

interface PayScheduleProps extends CommonComponentInterface<'Company.PaySchedule'> {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export const PaySchedule = ({
  companyId,
  defaultValues,
  dictionary,
  ...props
}: PayScheduleProps & BaseComponentInterface) => {
  useI18n('Company.PaySchedule')
  useComponentDictionary('Company.PaySchedule', dictionary)
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} defaultValues={defaultValues}>
        {props.children}
      </Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, children, defaultValues }: PayScheduleProps) => {
  const { baseSubmitHandler, onEvent, fieldErrors, setError: setBaseError } = useBase()

  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId,
  })

  const [mode, setMode] = useState<MODE>(
    paySchedules.payScheduleList?.length === 0 ? 'ADD_PAY_SCHEDULE' : 'LIST_PAY_SCHEDULES',
  )
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
  }

  const createPayScheduleMutation = usePaySchedulesCreateMutation()
  const updatePayScheduleMutation = usePaySchedulesUpdateMutation()

  const formMethods = useForm<PayScheduleInputs, unknown, PayScheduleOutputs>({
    resolver: zodResolver(PayScheduleSchema),
    defaultValues: transformedDefaultValues,
  })
  const { watch, setValue, reset, clearErrors, setError } = formMethods

  useEffect(() => {
    if (fieldErrors) {
      // TODO: These error messages are not being localized correctly
      fieldErrors.forEach(error => {
        setError(error.key as keyof PayScheduleInputs, { message: error.message })
      })
    }
  }, [setError, fieldErrors])

  const allValues = watch()

  const formattedAnchorPayDate = allValues.anchorPayDate
    ? formatDateToStringDate(allValues.anchorPayDate) || ''
    : ''
  const formattedAnchorEndOfPayPeriod = allValues.anchorEndOfPayPeriod
    ? formatDateToStringDate(allValues.anchorEndOfPayPeriod) || ''
    : ''

  const { data: payPreviewData, isLoading } = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: allValues.frequency,
      anchorPayDate: formattedAnchorPayDate,
      anchorEndOfPayPeriod: formattedAnchorEndOfPayPeriod,
      day1: allValues.day1 ?? undefined,
      day2: allValues.day2 ?? undefined,
    },
    {
      enabled: Boolean(
        allValues.anchorPayDate &&
          allValues.anchorEndOfPayPeriod &&
          (mode === 'ADD_PAY_SCHEDULE' || mode === 'EDIT_PAY_SCHEDULE'),
      ),
    },
  )

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

  const handleAdd = () => {
    setMode('ADD_PAY_SCHEDULE')
    reset({})
  }
  const handleCancel = () => {
    setMode('LIST_PAY_SCHEDULES')
    reset({})
    clearErrors()
    setBaseError(null)
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
  const handleContinue = () => {
    onEvent(componentEvents.PAY_SCHEDULE_DONE)
  }
  const onSubmit: SubmitHandler<PayScheduleOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const formatPayloadDate = (date: Date | undefined): string => {
        return date ? formatDateToStringDate(date) || '' : ''
      }

      if (mode === 'ADD_PAY_SCHEDULE') {
        const createPayScheduleResponse = await createPayScheduleMutation.mutateAsync({
          request: {
            companyId,
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
      } else if (mode === 'EDIT_PAY_SCHEDULE') {
        const version = currentPaySchedule?.version
        const updatePayScheduleResponse = await updatePayScheduleMutation.mutateAsync({
          request: {
            payScheduleId: currentPaySchedule?.uuid as string,
            companyId,
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
        handleContinue,
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
