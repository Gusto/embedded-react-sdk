import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OffCyclePayPeriodDateFormData } from './OffCyclePayPeriodDateFormTypes'
import styles from './OffCyclePayPeriodDateFormPresentation.module.scss'
import { useI18n } from '@/i18n'
import { CheckboxField, DatePickerField } from '@/components/Common'

/** @internal */
export interface OffCyclePayPeriodDateFormPresentationProps {
  /** Earliest selectable payment date for direct deposit (today plus the ACH lead time). */
  minCheckDate: Date
  /** Earliest selectable payment date when the payroll is check-only (today). */
  minCheckOnlyDate: Date
}

/** @internal */
export function OffCyclePayPeriodDateFormPresentation({
  minCheckDate,
  minCheckOnlyDate,
}: OffCyclePayPeriodDateFormPresentationProps) {
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  const { t } = useTranslation('Payroll.OffCyclePayPeriodDateForm')

  const { control } = useFormContext<OffCyclePayPeriodDateFormData>()
  const isCheckOnly = useWatch({ control, name: 'isCheckOnly' })

  // Mirrors the resolver's own `isCheckOnly ? today : minCheckDate` so the picker and the
  // validation agree. Without a minDate the rule existed only as a submit-time error, and
  // legacy gws-flows disables invalid dates in the picker (SDK-1274). Checking "check-only"
  // has to widen the bound back to today, live.
  const checkDateMinimum = isCheckOnly ? minCheckOnlyDate : minCheckDate

  return (
    <div className={styles.root}>
      <div className={styles.dateFields}>
        <DatePickerField name="startDate" label={t('startDateLabel')} isRequired />
        <DatePickerField name="endDate" label={t('endDateLabel')} isRequired />
      </div>

      <div className={styles.checkDateField}>
        <DatePickerField
          name="checkDate"
          label={t('checkDateLabel')}
          isRequired
          minDate={checkDateMinimum}
        />
      </div>

      <CheckboxField
        name="isCheckOnly"
        label={t('checkOnlyLabel')}
        description={t('checkOnlyDescription')}
      />
    </div>
  )
}
