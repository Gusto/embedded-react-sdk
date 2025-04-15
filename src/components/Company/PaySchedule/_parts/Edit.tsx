import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import type { PayScheduleInputs } from '../usePaySchedule'
import { usePaySchedule } from '../usePaySchedule'
import style from './Edit.module.scss'
import { DatePicker } from '@/components/Common/Inputs/DatePicker'
import {
  Flex,
  TextField,
  SelectField,
  RadioGroup,
  NumberInputField,
  Grid,
  CalendarDisplay,
  TextInputField,
} from '@/components/Common'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

export const Edit = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { payPeriodPreview, mode, payPreviewLoading } = usePaySchedule()
  const { control, setValue } = useFormContext<PayScheduleInputs>()
  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState<number>(0)

  const frequency = useWatch({ name: 'frequency' })
  const customTwicePerMonth = useWatch({ name: 'customTwicePerMonth' })
  const payPeriodPreviewRange = useWatch({ name: 'payPeriodPreviewRange' })

  const shouldShowDay1 =
    (frequency === 'Twice per month' && customTwicePerMonth === 'custom') || frequency === 'Monthly'
  const shouldShowDay2 = frequency === 'Twice per month' && customTwicePerMonth === 'custom'

  useEffect(() => {
    if (frequency === 'Twice per month' && customTwicePerMonth === '1st15th') {
      setValue('day1', 15)
      setValue('day2', 31)
    }
  }, [frequency, customTwicePerMonth, setValue])

  // This is a workaround to ensure that the pay period preview range is set when the selected pay period index changes
  // TODO: Once we have a RHF free select, that can be used and this effect can be removed
  useEffect(() => {
    if (payPeriodPreviewRange === undefined) {
      setValue('payPeriodPreviewRange', selectedPayPeriodIndex)
    }
  }, [selectedPayPeriodIndex, setValue, payPeriodPreviewRange])

  if (mode !== 'EDIT_PAY_SCHEDULE' && mode !== 'ADD_PAY_SCHEDULE') {
    return null
  }

  return (
    <div className={style.payScheduleContainer}>
      <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
        <div className={style.payScheduleForm}>
          <Flex flexDirection={'column'}>
            <TextInputField name="customName" label="Name" />
            <SelectField
              name="frequency"
              label={t('labels.frequency')}
              options={[
                { value: 'Every week', label: t('frequencies.everyWeek') },
                { value: 'Every other week', label: t('frequencies.everyOtherWeek') },
                { value: 'Twice per month', label: t('frequencies.twicePerMonth') },
                { value: 'Monthly', label: t('frequencies.monthly') },
              ]}
            />
            {frequency === 'Twice per month' && (
              <RadioGroup
                control={control}
                name="customTwicePerMonth"
                label={t('labels.frequencyOptions')}
                description={t('descriptions.frequencyOptionsDescription')}
                options={[
                  { value: '1st15th', label: t('frequencyOptions.15thAndLast') },
                  { value: 'custom', label: t('frequencyOptions.custom') },
                ]}
              />
            )}
            <DatePicker
              control={control}
              name="anchorPayDate"
              label={t('labels.firstPayDate')}
              description={t('descriptions.anchorPayDateDescription')}
            />
            <DatePicker
              control={control}
              name="anchorEndOfPayPeriod"
              label={t('labels.firstPayPeriodEndDate')}
              description={t('descriptions.anchorEndOfPayPeriodDescription')}
            />
            <div className={shouldShowDay1 ? '' : style.visuallyHidden}>
              <NumberInputField name="day1" label={t('labels.firstPayDayOfTheMonth')} />
            </div>
            <div className={shouldShowDay2 ? '' : style.visuallyHidden}>
              <NumberInputField name="day2" label={t('labels.lastPayDayOfTheMonth')} />
            </div>
          </Flex>
        </div>
        <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
          {payPeriodPreview && payPeriodPreview[selectedPayPeriodIndex] && (
            <CalendarDisplay
              key={selectedPayPeriodIndex}
              selectionControl={
                !payPreviewLoading && (
                  <SelectField
                    name="payPeriodPreviewRange"
                    label={t('labels.preview')}
                    options={payPeriodPreview.map((period, index) => {
                      return {
                        value: String(index),
                        label: `${formatDateNamedWeekdayShortPlusDate(period.startDate)} – ${formatDateNamedWeekdayShortPlusDate(period.endDate)}`,
                      }
                    })}
                    defaultValue={String(selectedPayPeriodIndex)}
                    onChange={(value: string) => {
                      const numericValue = Number(value)
                      if (!isNaN(numericValue)) {
                        setSelectedPayPeriodIndex(numericValue)
                      }
                    }}
                  />
                )
              }
              rangeSelected={{
                start: payPeriodPreview[selectedPayPeriodIndex].startDate as string,
                end: payPeriodPreview[selectedPayPeriodIndex].endDate as string,
                label: t('payPreview.payPeriod') || 'Pay Period',
              }}
              highlightDates={[
                {
                  date: payPeriodPreview[selectedPayPeriodIndex].checkDate as string,
                  highlightColor: 'primary',
                  label: t('payPreview.payday') || 'Payday',
                },
                {
                  date: payPeriodPreview[selectedPayPeriodIndex].runPayrollBy as string,
                  highlightColor: 'warning',
                  label: t('payPreview.payrollDeadline') || 'Payroll Deadline',
                },
              ]}
            />
          )}
        </Flex>
      </Grid>
    </div>
  )
}
