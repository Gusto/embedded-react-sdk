import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './PayPeriodDateFormPresentation.module.scss'
import type {
  PayPeriodDateFormData,
  PayPeriodDateFormPresentationProps,
} from './PayPeriodDateFormTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { CheckboxField, DatePickerField } from '@/components/Common'

export function PayPeriodDateFormPresentation({
  isCheckOnly,
  onCheckOnlyChange,
  isPending,
  hideActions,
}: PayPeriodDateFormPresentationProps) {
  const { Heading, Text, Button } = useComponentContext()
  useI18n('Payroll.PayPeriodDateForm')
  const { t } = useTranslation('Payroll.PayPeriodDateForm')
  const { setValue } = useFormContext<PayPeriodDateFormData>()

  const handleCheckOnlyChange = (checked: boolean) => {
    onCheckOnlyChange(checked)
    if (checked) {
      setValue('startDate', null)
      setValue('endDate', null)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.sectionHeader}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('description')}</Text>
      </div>

      <div className={styles.formSection}>
        {!isCheckOnly && (
          <div className={styles.dateFields}>
            <DatePickerField name="startDate" label={t('startDateLabel')} isRequired />
            <DatePickerField name="endDate" label={t('endDateLabel')} isRequired />
          </div>
        )}

        <div className={styles.checkDateField}>
          <DatePickerField name="checkDate" label={t('checkDateLabel')} isRequired />
        </div>

        <CheckboxField
          name="isCheckOnly"
          label={t('checkOnlyLabel')}
          description={t('checkOnlyDescription')}
          onChange={handleCheckOnlyChange}
        />
      </div>

      {!hideActions && (
        <div className={styles.actions}>
          <Button type="submit" isLoading={isPending} isDisabled={isPending}>
            {t('continueButton')}
          </Button>
        </div>
      )}
    </div>
  )
}
