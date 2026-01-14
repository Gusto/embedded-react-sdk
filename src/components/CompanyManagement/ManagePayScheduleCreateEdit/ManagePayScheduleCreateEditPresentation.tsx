import { useTranslation } from 'react-i18next'
import type { PayPeriods } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview'
import styles from './ManagePayScheduleCreateEdit.module.scss'
import {
  Flex,
  SelectField,
  RadioGroupField,
  Grid,
  TextInputField,
  NumberInputField,
  DatePickerField,
  ActionsLayout,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useI18n } from '@/i18n'

interface ManagePayScheduleCreateEditPresentationProps {
  isEditMode: boolean
  frequency: string
  customTwicePerMonth?: string
  payPeriodPreview?: PayPeriods[]
  previewLoading: boolean
  selectedPayPeriodIndex: number
  onPayPeriodIndexChange: (index: number) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function ManagePayScheduleCreateEditPresentation({
  isEditMode,
  frequency,
  customTwicePerMonth,
  payPeriodPreview,
  previewLoading,
  selectedPayPeriodIndex,
  onPayPeriodIndexChange,
  onCancel,
  isSubmitting,
}: ManagePayScheduleCreateEditPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleCreateEdit')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleCreateEdit')
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()

  const shouldShowDay1 =
    (frequency === 'Twice per month' && customTwicePerMonth === 'custom') || frequency === 'Monthly'
  const shouldShowDay2 = frequency === 'Twice per month' && customTwicePerMonth === 'custom'

  const currentPreviewPeriod = payPeriodPreview?.[selectedPayPeriodIndex]

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={2}>
        <Components.Heading as="h2">
          {isEditMode ? t('headings.editPaySchedule') : t('headings.addPaySchedule')}
        </Components.Heading>
        <Components.Text variant="supporting">{t('description')}</Components.Text>
      </Flex>

      <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
        <Flex flexDirection="column" gap={16}>
          <TextInputField name="customName" label={t('labels.name')} isRequired />

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

          {shouldShowDay1 && (
            <NumberInputField name="day1" label={t('labels.firstPayDayOfTheMonth')} isRequired />
          )}

          {shouldShowDay2 && (
            <NumberInputField name="day2" label={t('labels.lastPayDayOfTheMonth')} isRequired />
          )}
        </Flex>

        <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
          {payPeriodPreview && currentPreviewPeriod ? (
            <div className={styles.calendarContainer}>
              {!previewLoading && (
                <Components.Select
                  label={t('labels.preview')}
                  isRequired
                  options={payPeriodPreview.map((period, index) => ({
                    value: String(index),
                    label: dateFormatter.formatPayPeriodRange(period.startDate, period.endDate),
                  }))}
                  value={String(selectedPayPeriodIndex)}
                  onChange={(value: string) => {
                    const numericValue = Number(value)
                    if (!isNaN(numericValue)) {
                      onPayPeriodIndexChange(numericValue)
                    }
                  }}
                />
              )}
              <Components.CalendarPreview
                key={selectedPayPeriodIndex}
                dateRange={{
                  start: new Date(currentPreviewPeriod.startDate as string),
                  end: new Date(currentPreviewPeriod.endDate as string),
                  label: t('payPreview.payPeriod'),
                }}
                highlightDates={[
                  {
                    date: new Date(currentPreviewPeriod.checkDate as string),
                    highlightColor: 'primary',
                    label: t('payPreview.payday'),
                  },
                  {
                    date: new Date(currentPreviewPeriod.runPayrollBy as string),
                    highlightColor: 'secondary',
                    label: t('payPreview.payrollDeadline'),
                  },
                ]}
              />
            </div>
          ) : (
            <div className={styles.calendarContainer}>
              <Components.Alert status="info" label={t('previewAlert.title')}>
                <Components.Text>{t('previewAlert.description')}</Components.Text>
              </Components.Alert>
            </div>
          )}
        </Flex>
      </Grid>

      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onCancel}>
          {t('actions.cancel')}
        </Components.Button>
        <Components.Button type="submit" isLoading={isSubmitting}>
          {t('actions.save')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
