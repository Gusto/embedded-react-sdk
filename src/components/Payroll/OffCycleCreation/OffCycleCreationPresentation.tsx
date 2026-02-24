import { useTranslation } from 'react-i18next'
import { OffCycleReasonSelectionPresentation } from '../OffCycleReasonSelection'
import { OffCyclePayPeriodDateFormPresentation } from '../OffCyclePayPeriodDateForm/OffCyclePayPeriodDateFormPresentation'
import type { OffCycleCreationPresentationProps } from './OffCycleCreationTypes'
import styles from './OffCycleCreationPresentation.module.scss'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function OffCycleCreationPresentation({ isPending }: OffCycleCreationPresentationProps) {
  useI18n('Payroll.OffCycleCreation')
  const { t } = useTranslation('Payroll.OffCycleCreation')
  const { Heading, Text, Button } = useComponentContext()

  return (
    <div className={styles.root}>
      <div className={styles.sectionHeader}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </div>

      <div className={styles.section}>
        <OffCyclePayPeriodDateFormPresentation />
      </div>

      <div className={styles.section}>
        <OffCycleReasonSelectionPresentation name="reason" />
      </div>

      {/* TODO: EmployeeSelection section — will compose EmployeeSelectionPresentation */}

      {/* TODO: Deductions section — will compose DeductionsPresentation */}

      {/* TODO: TaxWithholdingRates section — will compose TaxWithholdingRatesPresentation */}

      <div className={styles.actions}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('continueCta')}
        </Button>
      </div>
    </div>
  )
}
