import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import type { PayScheduleInputs } from '../usePaySchedule'
import { usePaySchedule } from '../usePaySchedule'
import style from './Edit.module.scss'
import {
  Flex,
  SelectField,
  RadioGroupField,
  Grid,
  TextInputField,
  NumberInputField,
  DatePickerField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

export const Edit = () => {
  const Components = useComponentContext()
  const { t } = useTranslation('Company.PaySchedule')
  const { payPeriodPreview, mode, payPreviewLoading } = usePaySchedule()
  const { setValue } = useFormContext<PayScheduleInputs>()
  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState<number>(0)

  const frequency = useWatch({ name: 'frequency' })
  const customTwicePerMonth = useWatch({ name: 'customTwicePerMonth' })

  const shouldShowDay1 =
    (frequency === 'Twice per month' && customTwicePerMonth === 'custom') || frequency === 'Monthly'
  const shouldShowDay2 = frequency === 'Twice per month' && customTwicePerMonth === 'custom'

  useEffect(() => {
    if (frequency === 'Twice per month' && customTwicePerMonth === '1st15th') {
      setValue('day1', 15)
      setValue('day2', 31)
    }
  }, [frequency, customTwicePerMonth, setValue])

  if (mode !== 'EDIT_PAY_SCHEDULE' && mode !== 'ADD_PAY_SCHEDULE') {
    return null
  }

  return (
    <div className={style.payScheduleContainer}>
      <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
        <div className={style.payScheduleForm}>
          <Flex flexDirection={'column'}>
            <TextInputField name="customName" label="Name" isRequired />
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
            />
            {frequency === 'Twice per month' && (
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
              description={t('descriptions.anchorPayDateDescription')}
              isRequired
            />
            <DatePickerField
              name="anchorEndOfPayPeriod"
              label={t('labels.firstPayPeriodEndDate')}
              description={t('descriptions.anchorEndOfPayPeriodDescription')}
              isRequired
            />
            <div className={shouldShowDay1 ? '' : style.visuallyHidden}>
              <NumberInputField name="day1" label={t('labels.firstPayDayOfTheMonth')} isRequired />
            </div>
            <div className={shouldShowDay2 ? '' : style.visuallyHidden}>
              <NumberInputField name="day2" label={t('labels.lastPayDayOfTheMonth')} isRequired />
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
                  options={payPeriodPreview.map((period, index) => {
                    return {
                      value: String(index),
                      label: `${formatDateNamedWeekdayShortPlusDate(period.startDate)} – ${formatDateNamedWeekdayShortPlusDate(period.endDate)}`,
                    }
                  })}
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
                  start: new Date(payPeriodPreview[selectedPayPeriodIndex].startDate as string),
                  end: new Date(payPeriodPreview[selectedPayPeriodIndex].endDate as string),
                  label: t('payPreview.payPeriod') || 'Pay Period',
                }}
                highlightDates={[
                  {
                    date: new Date(payPeriodPreview[selectedPayPeriodIndex].checkDate as string),
                    highlightColor: 'primary',
                    label: t('payPreview.payday') || 'Payday',
                  },
                  {
                    date: new Date(payPeriodPreview[selectedPayPeriodIndex].runPayrollBy as string),
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
  )
}
