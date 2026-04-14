import { FormProvider } from 'react-hook-form'
import { useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import type { PaySchedule as PayScheduleType } from '@gusto/embedded-api/models/components/payschedule'
import type { MODE } from './usePaySchedule'
import { PayScheduleProvider, type PayScheduleDefaultValues } from './usePaySchedule'
import { Actions, Edit, Head, List } from './_parts'
import { usePayScheduleForm } from './shared/usePayScheduleForm'
import { Form } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
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
  const { onEvent } = useBase()

  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId,
  })

  const [mode, setMode] = useState<MODE>(
    paySchedules.paySchedules?.length === 0 ? 'ADD_PAY_SCHEDULE' : 'LIST_PAY_SCHEDULES',
  )
  const [currentPayScheduleId, setCurrentPayScheduleId] = useState<string | undefined>()

  const hookResult = usePayScheduleForm({
    companyId,
    payScheduleId: currentPayScheduleId,
    defaultValues: defaultValues
      ? {
          customName: defaultValues.customName ?? '',
          frequency: defaultValues.frequency,
          anchorPayDate: defaultValues.anchorPayDate?.toString(),
          anchorEndOfPayPeriod: defaultValues.anchorEndOfPayPeriod?.toString(),
          day1: defaultValues.day1 ?? undefined,
          day2: defaultValues.day2 ?? undefined,
        }
      : undefined,
  })

  const formMethods = hookResult.isLoading ? null : hookResult.form.hookFormInternals.formMethods

  const handleAdd = () => {
    formMethods?.reset()
    setCurrentPayScheduleId(undefined)
    setMode('ADD_PAY_SCHEDULE')
  }

  const handleCancel = () => {
    formMethods?.reset()
    setCurrentPayScheduleId(undefined)
    setMode('LIST_PAY_SCHEDULES')
  }

  const handleEdit = (schedule: PayScheduleType) => {
    formMethods?.reset()
    setCurrentPayScheduleId(schedule.uuid)
    setMode('EDIT_PAY_SCHEDULE')
  }

  const handleContinue = () => {
    onEvent(componentEvents.PAY_SCHEDULE_DONE)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hookResult.isLoading) return

    const result = await hookResult.actions.onSubmit()
    if (result) {
      if (result.mode === 'create') {
        onEvent(componentEvents.PAY_SCHEDULE_CREATED, { paySchedule: result.data })
      } else {
        onEvent(componentEvents.PAY_SCHEDULE_UPDATED, { paySchedule: result.data })
      }
      setCurrentPayScheduleId(undefined)
      setMode('LIST_PAY_SCHEDULES')
    }
  }

  const currentPaySchedule = !hookResult.isLoading ? hookResult.data.paySchedule : null

  return (
    <PayScheduleProvider
      value={{
        companyId,
        handleAdd,
        handleEdit,
        handleCancel,
        handleContinue,
        mode,
        isPending: !hookResult.isLoading ? hookResult.status.isPending : false,
        paySchedules: paySchedules.paySchedules,
        payPeriodPreview: !hookResult.isLoading
          ? (hookResult.data.payPeriodPreview ?? undefined)
          : undefined,
        payPreviewLoading: !hookResult.isLoading ? hookResult.data.payPreviewLoading : false,
        currentPaySchedule,
        paymentSpeedDays: !hookResult.isLoading ? hookResult.data.paymentSpeedDays : 2,
      }}
    >
      <span data-testid="pay-schedule-edit-form">
        {formMethods ? (
          <FormProvider {...formMethods}>
            <Form onSubmit={handleFormSubmit}>
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
        ) : null}
      </span>
    </PayScheduleProvider>
  )
}
