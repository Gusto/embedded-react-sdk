import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './OffCyclePayPeriodDateFormPresentation.module.scss'
import type {
  OffCyclePayPeriodDateFormData,
  OffCyclePayPeriodDateFormPresentationProps,
} from './OffCyclePayPeriodDateFormTypes'
import { useI18n } from '@/i18n'
import { CheckboxField, DatePickerField } from '@/components/Common'

export function OffCyclePayPeriodDateFormPresentation({
  isCheckOnly,
  onCheckOnlyChange,
}: OffCyclePayPeriodDateFormPresentationProps) {
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  const { t } = useTranslation('Payroll.OffCyclePayPeriodDateForm')
  const { setValue } = useFormContext<OffCyclePayPeriodDateFormData>()

  const handleCheckOnlyChange = (checked: boolean) => {
    onCheckOnlyChange(checked)
    if (checked) {
      setValue('startDate', null)
      setValue('endDate', null)
    }
  }

  return (
    <div className={styles.root}>
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
  )
}
