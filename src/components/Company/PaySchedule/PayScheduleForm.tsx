import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePayScheduleForm } from './shared/usePayScheduleForm'
import type { UsePayScheduleFormProps } from './shared/usePayScheduleForm'
import style from './PayScheduleForm.module.scss'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import {
  Flex,
  Grid,
  TextInputField,
  SelectField,
  RadioGroupField,
  DatePickerField,
  NumberInputField,
  ActionsLayout,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

interface PayScheduleFormProps extends UsePayScheduleFormProps {
  onEvent: OnEventType<EventType, unknown>
}

export function PayScheduleForm({ onEvent, ...hookProps }: PayScheduleFormProps) {
  return (
    <BaseBoundaries componentName="Company.PayScheduleForm">
      <PayScheduleFormRoot onEvent={onEvent} {...hookProps} />
    </BaseBoundaries>
  )
}

function PayScheduleFormRoot({ onEvent, ...hookProps }: PayScheduleFormProps) {
  const { t } = useTranslation('Company.PaySchedule')
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const paySchedule = usePayScheduleForm(hookProps)
  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState(0)

  if (paySchedule.isLoading) {
    return <BaseLayout isLoading error={paySchedule.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    const result = await paySchedule.actions.onSubmit()
    if (result) {
      onEvent(
        result.mode === 'create'
          ? componentEvents.PAY_SCHEDULE_CREATED
          : componentEvents.PAY_SCHEDULE_UPDATED,
        { paySchedule: result.data },
      )
    }
  }

  const { Fields } = paySchedule.form
  const { paymentSpeedDays, payPreviewLoading } = paySchedule.data
  const payPeriodPreview = paySchedule.data.payPeriodPreview ?? undefined

  return (
    <BaseLayout error={paySchedule.errorHandling.errors}>
      <SDKFormProvider formHookResult={paySchedule}>
        <Form onSubmit={() => void handleSubmit()}>
          <Flex flexDirection="column">
            <Flex justifyContent="space-between" flexDirection="column" gap={4}>
              <header>
                <Components.Heading as="h2">
                  {paySchedule.status.mode === 'create'
                    ? t('headings.addPaySchedule')
                    : t('headings.editPaySchedule')}
                </Components.Heading>
              </header>
            </Flex>
            <div className={style.payScheduleContainer}>
              <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
                <div className={style.payScheduleForm}>
                  <Flex flexDirection="column">
                    <TextInputField
                      name="customName"
                      label={t('labels.name')}
                      isRequired
                      errorMessage={t('validations.name')}
                    />
                    <SelectField
                      name="frequency"
                      label={t('labels.frequency')}
                      options={[
                        { value: 'Every week', label: t('frequencies.everyWeek') },
                        { value: 'Every other week', label: t('frequencies.everyOtherWeek') },
                        { value: 'Twice per month', label: t('frequencies.twicePerMonth') },
                        { value: 'Monthly', label: t('frequencies.monthly') },
                      ]}
                      isRequired
                      errorMessage={t('validations.frequency')}
                    />
                    {Fields.CustomTwicePerMonth !== undefined && (
                      <RadioGroupField
                        name="customTwicePerMonth"
                        label={t('labels.frequencyOptions')}
                        description={t('descriptions.frequencyOptionsDescription')}
                        options={[
                          { value: '1st15th', label: t('frequencyOptions.15thAndLast') },
                          { value: 'custom', label: t('frequencyOptions.custom') },
                        ]}
                      />
                    )}
                    <DatePickerField
                      name="anchorPayDate"
                      label={t('labels.firstPayDate')}
                      description={t('descriptions.anchorPayDateDescription', {
                        count: paymentSpeedDays,
                      })}
                      isRequired
                      errorMessage={t('validations.firstPayDate')}
                      minDate={new Date()}
                    />
                    <DatePickerField
                      name="anchorEndOfPayPeriod"
                      label={t('labels.firstPayPeriodEndDate')}
                      description={t('descriptions.anchorEndOfPayPeriodDescription')}
                      isRequired
                      errorMessage={t('validations.firstPayPeriodEndDate')}
                    />
                    <div className={Fields.Day1 !== undefined ? '' : style.visuallyHidden}>
                      <NumberInputField
                        name="day1"
                        label={t('labels.firstPayDayOfTheMonth')}
                        isRequired
                        errorMessage={t('validations.firstPayDayOfTheMonth')}
                      />
                    </div>
                    <div className={Fields.Day2 !== undefined ? '' : style.visuallyHidden}>
                      <NumberInputField
                        name="day2"
                        label={t('labels.lastPayDayOfTheMonth')}
                        isRequired
                        errorMessage={t('validations.lastPayDayOfTheMonth')}
                      />
                    </div>
                  </Flex>
                </div>
                <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
                  {payPeriodPreview && payPeriodPreview[selectedPayPeriodIndex] ? (
                    <div className={style.calendarContainer}>
                      {!payPreviewLoading && (
                        <Components.Select
                          label={t('labels.preview')}
                          isRequired
                          options={payPeriodPreview.map((period, index) => ({
                            value: String(index),
                            label: dateFormatter.formatPayPeriodRange(
                              period.startDate.toString(),
                              period.endDate.toString(),
                            ),
                          }))}
                          value={String(selectedPayPeriodIndex)}
                          onChange={(value: string) => {
                            const numericValue = Number(value)
                            if (!isNaN(numericValue)) {
                              setSelectedPayPeriodIndex(numericValue)
                            }
                          }}
                        />
                      )}
                      <Components.CalendarPreview
                        key={selectedPayPeriodIndex}
                        dateRange={{
                          start: new Date(
                            payPeriodPreview[selectedPayPeriodIndex].startDate.toString(),
                          ),
                          end: new Date(
                            payPeriodPreview[selectedPayPeriodIndex].endDate.toString(),
                          ),
                          label: t('payPreview.payPeriod') || 'Pay Period',
                        }}
                        highlightDates={[
                          {
                            date: new Date(
                              payPeriodPreview[selectedPayPeriodIndex].checkDate.toString(),
                            ),
                            highlightColor: 'primary',
                            label: t('payPreview.payday') || 'Payday',
                          },
                          {
                            date: new Date(
                              payPeriodPreview[selectedPayPeriodIndex].runPayrollBy.toString(),
                            ),
                            highlightColor: 'secondary',
                            label: t('payPreview.payrollDeadline') || 'Payroll Deadline',
                          },
                        ]}
                      />
                    </div>
                  ) : (
                    <div className={style.calendarContainer}>
                      <Components.Alert
                        status="info"
                        label={t('previewAlert.title', 'Pay Schedule Preview')}
                      >
                        <Components.Text>
                          {t(
                            'previewAlert.description',
                            'Complete all the required fields on the left to see a preview of your pay schedule.',
                          )}
                        </Components.Text>
                      </Components.Alert>
                    </div>
                  )}
                </Flex>
              </Grid>
            </div>
            <ActionsLayout>
              <Components.Button
                variant="secondary"
                onClick={() => {
                  onEvent(componentEvents.CANCEL)
                }}
              >
                {t('actions.cancel')}
              </Components.Button>
              <Components.Button type="submit" isLoading={paySchedule.status.isPending}>
                {t('actions.save')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
