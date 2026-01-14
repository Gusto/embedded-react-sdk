import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { usePaySchedulesGetPreview } from '@gusto/embedded-api/react-query/paySchedulesGetPreview'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { usePaySchedulesCreateMutation } from '@gusto/embedded-api/react-query/paySchedulesCreate'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { Frequency } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayschedules'
import { ManagePayScheduleCreateEditPresentation } from './ManagePayScheduleCreateEditPresentation'
import { Form } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

export const PayScheduleFormSchema = z.object({
  frequency: z.enum(['Every week', 'Every other week', 'Twice per month', 'Monthly']),
  anchorPayDate: z.date().optional(),
  anchorEndOfPayPeriod: z.date().optional(),
  day1: z.number().min(1).max(31).optional(),
  day2: z.number().min(1).max(31).optional(),
  customName: z.string().optional(),
  customTwicePerMonth: z.string().optional(),
})

export type PayScheduleFormInputs = z.input<typeof PayScheduleFormSchema>
export type PayScheduleFormOutputs = z.output<typeof PayScheduleFormSchema>

interface ManagePayScheduleCreateEditProps extends CommonComponentInterface<'CompanyManagement.ManagePayScheduleCreateEdit'> {
  companyId: string
  payScheduleUuid?: string
}

export function ManagePayScheduleCreateEdit({
  companyId,
  payScheduleUuid,
  ...props
}: ManagePayScheduleCreateEditProps & BaseComponentInterface) {
  useI18n('CompanyManagement.ManagePayScheduleCreateEdit')

  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} payScheduleUuid={payScheduleUuid} />
    </BaseComponent>
  )
}

interface RootProps {
  companyId: string
  payScheduleUuid?: string
}

function Root({ companyId, payScheduleUuid }: RootProps) {
  const { baseSubmitHandler, onEvent, fieldErrors } = useBase()
  const isEditMode = Boolean(payScheduleUuid)

  const { data: existingSchedule } = usePaySchedulesGet(
    { companyId, payScheduleId: payScheduleUuid ?? '' },
    { enabled: isEditMode && Boolean(payScheduleUuid) },
  )

  const { mutateAsync: createPaySchedule, isPending: isCreating } = usePaySchedulesCreateMutation()
  const { mutateAsync: updatePaySchedule, isPending: isUpdating } = usePaySchedulesUpdateMutation()

  const isSubmitting = isCreating || isUpdating

  const getDefaultValues = (): PayScheduleFormInputs => {
    if (isEditMode && existingSchedule?.payScheduleObject) {
      const schedule = existingSchedule.payScheduleObject
      return {
        frequency: (schedule.frequency ?? 'Every week') as Frequency,
        anchorPayDate: schedule.anchorPayDate ? new Date(schedule.anchorPayDate) : undefined,
        anchorEndOfPayPeriod: schedule.anchorEndOfPayPeriod
          ? new Date(schedule.anchorEndOfPayPeriod)
          : undefined,
        day1: schedule.day1 ?? undefined,
        day2: schedule.day2 ?? undefined,
        customName: schedule.customName ?? '',
        customTwicePerMonth: undefined,
      }
    }
    return {
      frequency: 'Every week',
      customName: '',
    }
  }

  const formMethods = useForm<PayScheduleFormInputs, unknown, PayScheduleFormOutputs>({
    resolver: zodResolver(PayScheduleFormSchema),
    defaultValues: getDefaultValues(),
  })

  const { watch, setValue, setError, reset } = formMethods
  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState(0)

  useEffect(() => {
    if (isEditMode && existingSchedule?.payScheduleObject) {
      reset(getDefaultValues())
    }
  }, [existingSchedule, isEditMode])

  useEffect(() => {
    if (fieldErrors) {
      fieldErrors.forEach(error => {
        setError(error.errorKey as keyof PayScheduleFormInputs, { message: error.message })
      })
    }
  }, [setError, fieldErrors])

  const allValues = watch()

  const formattedAnchorPayDate = allValues.anchorPayDate
    ? (formatDateToStringDate(allValues.anchorPayDate) ?? '')
    : ''
  const formattedAnchorEndOfPayPeriod = allValues.anchorEndOfPayPeriod
    ? (formatDateToStringDate(allValues.anchorEndOfPayPeriod) ?? '')
    : ''

  const { data: previewData, isLoading: previewLoading } = usePaySchedulesGetPreview(
    {
      companyId,
      frequency: allValues.frequency,
      anchorPayDate: formattedAnchorPayDate,
      anchorEndOfPayPeriod: formattedAnchorEndOfPayPeriod,
      day1: allValues.day1,
      day2: allValues.day2,
    },
    {
      enabled: Boolean(allValues.anchorPayDate && allValues.anchorEndOfPayPeriod),
    },
  )

  useEffect(() => {
    if (
      allValues.frequency === 'Twice per month' &&
      allValues.day1 === 15 &&
      allValues.day2 === 31 &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', '1st15th')
    } else if (
      allValues.frequency === 'Twice per month' &&
      allValues.customTwicePerMonth === undefined
    ) {
      setValue('customTwicePerMonth', 'custom')
    }
  }, [allValues.frequency, allValues.day1, allValues.day2, setValue, allValues.customTwicePerMonth])

  useEffect(() => {
    if (allValues.frequency === 'Twice per month' && allValues.customTwicePerMonth === '1st15th') {
      setValue('day1', 15)
      setValue('day2', 31)
    }
  }, [allValues.frequency, allValues.customTwicePerMonth, setValue])

  const handleCancel = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CANCEL)
  }

  const onSubmit: SubmitHandler<PayScheduleFormOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const formatDate = (date: Date | undefined): string => {
        return date ? (formatDateToStringDate(date) ?? '') : ''
      }

      if (isEditMode && payScheduleUuid) {
        const version = existingSchedule?.payScheduleObject?.version
        const response = await updatePaySchedule({
          request: {
            payScheduleId: payScheduleUuid,
            companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: formatDate(payload.anchorPayDate),
              anchorEndOfPayPeriod: formatDate(payload.anchorEndOfPayPeriod),
              customName: payload.customName,
              day1: payload.day1,
              day2: payload.day2,
              version: version ?? '',
            },
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_UPDATED, response)
      } else {
        const response = await createPaySchedule({
          request: {
            companyId,
            requestBody: {
              frequency: payload.frequency,
              anchorPayDate: formatDate(payload.anchorPayDate),
              anchorEndOfPayPeriod: formatDate(payload.anchorEndOfPayPeriod),
              customName: payload.customName,
              day1: payload.day1,
              day2: payload.day2,
            },
          },
        })
        onEvent(componentEvents.PAY_SCHEDULE_CREATED, response)
      }
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <ManagePayScheduleCreateEditPresentation
          isEditMode={isEditMode}
          frequency={allValues.frequency}
          customTwicePerMonth={allValues.customTwicePerMonth}
          payPeriodPreview={previewData?.object?.payPeriods}
          previewLoading={previewLoading}
          selectedPayPeriodIndex={selectedPayPeriodIndex}
          onPayPeriodIndexChange={setSelectedPayPeriodIndex}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Form>
    </FormProvider>
  )
}

ManagePayScheduleCreateEdit.displayName = 'ManagePayScheduleCreateEdit'
