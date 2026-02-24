import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from './OffCyclePayPeriodDateFormPresentation.module.scss'
import type { OffCyclePayPeriodDateFormData } from './OffCyclePayPeriodDateFormTypes'
import { useI18n } from '@/i18n'
import { CheckboxField, DatePickerField } from '@/components/Common'

export function OffCyclePayPeriodDateFormPresentation() {
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  const { t } = useTranslation('Payroll.OffCyclePayPeriodDateForm')
  const { control, setValue } = useFormContext<OffCyclePayPeriodDateFormData>()
  const isCheckOnly = useWatch({ control, name: 'isCheckOnly' })

  const handleCheckOnlyChange = (checked: boolean) => {
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
