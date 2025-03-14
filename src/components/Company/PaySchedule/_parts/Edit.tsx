import { useFormContext, useWatch } from 'react-hook-form'
import { ListBoxItem } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { PayScheduleInputs, usePaySchedule } from '../PaySchedule'
import style from './Edit.module.scss'
import { DatePicker } from '@/components/Common/Inputs/DatePicker'
import {
  Flex,
  TextField,
  Select,
  RadioGroup,
  NumberField,
  Grid,
  CalendarDisplay,
} from '@/components/Common'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

export const Edit = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { payPeriodPreview, mode, payPreviewLoading } = usePaySchedule()
  const { control, setValue } = useFormContext<PayScheduleInputs>()
  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState<number>(0)

  const frequency = useWatch({ name: 'frequency' })
  const customTwicePerMonth = useWatch({ name: 'custom_twice_per_month' })
  const payPeriodPreviewRange = useWatch({ name: 'pay_period_preview_range' })

  const shouldShowDay1 =
    (frequency === 'Twice per month' && customTwicePerMonth === 'custom') || frequency === 'Monthly'
  const shouldShowDay2 = frequency === 'Twice per month' && customTwicePerMonth === 'custom'

  useEffect(() => {
    if (frequency === 'Twice per month' && customTwicePerMonth === '1st15th') {
      setValue('day_1', 15)
      setValue('day_2', 31)
    }
  }, [frequency, customTwicePerMonth, setValue])

  // This is a workaround to ensure that the pay period preview range is set when the selected pay period index changes
  // TODO: Once we have a RHF free select, that can be used and this effect can be removed
  useEffect(() => {
    if (payPeriodPreviewRange === undefined) {
      setValue('pay_period_preview_range', selectedPayPeriodIndex)
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
            <TextField control={control} name="custom_name" label="Name" />
            <Select
              control={control}
              name="frequency"
              label={t('labels.frequency')}
              items={[
                { id: 'Every week', name: t('frequencies.everyWeek') },
                { id: 'Every other week', name: t('frequencies.everyOtherWeek') },
                { id: 'Twice per month', name: t('frequencies.twicePerMonth') },
                { id: 'Monthly', name: t('frequencies.monthly') },
              ]}
            >
              {option => <ListBoxItem>{option.name}</ListBoxItem>}
            </Select>
            {frequency === 'Twice per month' && (
              <RadioGroup
                control={control}
                name="custom_twice_per_month"
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
              name="anchor_pay_date"
              label={t('labels.firstPayDate')}
              description={t('descriptions.anchorPayDateDescription')}
            />
            <DatePicker
              control={control}
              name="anchor_end_of_pay_period"
              label={t('labels.firstPayPeriodEndDate')}
              description={t('descriptions.anchorEndOfPayPeriodDescription')}
            />
            <div className={shouldShowDay1 ? '' : style.visuallyHidden}>
              <NumberField
                control={control}
                name="day_1"
                label={t('labels.firstPayDayOfTheMonth')}
              />
            </div>
            <div className={shouldShowDay2 ? '' : style.visuallyHidden}>
              <NumberField
                control={control}
                name="day_2"
                label={t('labels.lastPayDayOfTheMonth')}
              />
            </div>
          </Flex>
        </div>
        <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
          {payPeriodPreview && payPeriodPreview[selectedPayPeriodIndex] && (
            <CalendarDisplay
              key={selectedPayPeriodIndex}
              selectionControl={
                !payPreviewLoading && (
                  <Select
                    control={control}
                    name="pay_period_preview_range"
                    label={t('labels.preview')}
                    items={payPeriodPreview.map((period, index) => {
                      return {
                        id: index,
                        name: `${formatDateNamedWeekdayShortPlusDate(period.start_date)} – ${formatDateNamedWeekdayShortPlusDate(period.end_date)}`,
                      }
                    })}
                    defaultSelectedKey={selectedPayPeriodIndex}
                    onSelectionChange={value => {
                      if (typeof value === 'number') {
                        setSelectedPayPeriodIndex(value)
                      }
                    }}
                  >
                    {option => <ListBoxItem key={option.id}>{option.name}</ListBoxItem>}
                  </Select>
                )
              }
              rangeSelected={{
                start: payPeriodPreview[selectedPayPeriodIndex].start_date as string,
                end: payPeriodPreview[selectedPayPeriodIndex].end_date as string,
                label: t('payPreview.payPeriod') || 'Pay Period',
              }}
              highlightDates={[
                {
                  date: payPeriodPreview[selectedPayPeriodIndex].check_date as string,
                  highlightColor: 'primary',
                  label: t('payPreview.payday') || 'Payday',
                },
                {
                  date: payPeriodPreview[selectedPayPeriodIndex].run_payroll_by as string,
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
