import { Flex, TextField, Select, RadioGroup, NumberField, Grid } from '@/components/Common'
import { PayPreviewCard } from './PayPreviewCard/PayPreviewCard'
import { useFormContext } from 'react-hook-form'
import { ListBoxItem } from 'react-aria-components'
import { DatePicker } from '@/components/Common/Inputs/DatePicker'
import { PayScheduleInputs, usePaySchedule } from '../PaySchedule'
import Spinner from '@/assets/icons/spinner_small.svg?react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const Edit = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { payPeriodPreview, mode, payPreviewLoading } = usePaySchedule()
  const { control, watch, setValue } = useFormContext<PayScheduleInputs>()

  const frequency = watch('frequency')
  const custom2xPerMonth = watch('custom_twice_per_month') === 'true' ? true : false

  const firstPayDate = watch('anchor_pay_date')
  const day1Value = watch('day_1')

  // Keep custom fields in sync with frequency
  useEffect(() => {
    if (day1Value !== firstPayDate?.day && firstPayDate?.day && custom2xPerMonth) {
      setValue('day_1', firstPayDate.day)
    } else {
      setValue('day_1', undefined)
    }
  }, [custom2xPerMonth, day1Value, firstPayDate, setValue])

  useEffect(() => {
    if (frequency !== 'Twice per month') {
      setValue('custom_twice_per_month', undefined)
    } else if (!custom2xPerMonth) {
      setValue('day_1', 15)
      setValue('day_2', 31)
    }
  }, [custom2xPerMonth, frequency, setValue])

  if (mode !== 'EDIT_PAY_SCHEDULE' && mode !== 'ADD_PAY_SCHEDULE') {
    return null
  }

  return (
    <div style={{ width: '100%' }}>
      <Grid gap={4} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
        <div style={{ width: '100%' }}>
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
                  { value: 'false', label: t('frequencyOptions.15thAndLast') },
                  { value: 'true', label: t('frequencyOptions.custom') },
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
            {custom2xPerMonth && (
              <NumberField
                control={control}
                name="day_1"
                label={t('labels.firstPayDayOfTheMonth')}
              />
            )}
            {custom2xPerMonth && (
              <NumberField
                control={control}
                name="day_2"
                label={t('labels.lastPayDayOfTheMonth')}
              />
            )}
          </Flex>
        </div>
        <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
          {!payPreviewLoading &&
            payPeriodPreview &&
            payPeriodPreview.map((payPeriod, index) => {
              if (index >= 3) {
                return
              }
              return (
                <PayPreviewCard
                  key={index}
                  checkdate={payPeriod.check_date}
                  endDate={payPeriod.end_date}
                  startDate={payPeriod.start_date}
                  runPayrollBy={payPeriod.run_payroll_by}
                />
              )
            })}
          {payPreviewLoading && (
            <Flex justifyContent={'center'} alignItems={'center'}>
              <Spinner title={t('loading')} />
            </Flex>
          )}
        </Flex>
      </Grid>
    </div>
  )
}
