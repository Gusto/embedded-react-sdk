import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayPeriodFrequency } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import styles from './OffCycleTaxWithholdingModal.module.scss'
import type { OffCycleTaxWithholdingModalProps } from './OffCycleTaxWithholdingModalTypes'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const PAY_PERIOD_FREQUENCY_OPTIONS: PayPeriodFrequency[] = [
  'every_week',
  'every_other_week',
  'twice_per_month',
  'monthly',
]

export function OffCycleTaxWithholdingModal({
  isOpen,
  config,
  onPayPeriodFrequencyChange,
  onWithholdingRateChange,
  onDone,
  onCancel,
}: OffCycleTaxWithholdingModalProps) {
  useI18n('Payroll.OffCycleTaxWithholding')
  const { t } = useTranslation('Payroll.OffCycleTaxWithholding')
  const { Modal, Select, RadioGroup, Heading, Text, Button } = useComponentContext()

  const frequencyOptions = useMemo(
    () =>
      PAY_PERIOD_FREQUENCY_OPTIONS.map(freq => ({
        value: freq,
        label: t(`payPeriodFrequency.${freq}` as const),
      })),
    [t],
  )

  const frequencyDisplayText = t(
    `payPeriodFrequency.${config.payPeriodFrequency}` as const,
  ).toLowerCase()

  const withholdingRateOptions = useMemo(
    () => [
      {
        value: 'supplemental' as const,
        label: t('modal.supplementalSection.useSupplementalRate'),
        description: t('modal.supplementalSection.useSupplementalRateDescription'),
      },
      {
        value: 'regular' as const,
        label: t('modal.supplementalSection.useRegularRate', {
          frequency: frequencyDisplayText,
        }),
        description: t('modal.supplementalSection.useRegularRateDescription'),
      },
    ],
    [t, frequencyDisplayText],
  )

  const handlePayPeriodChange = (value: string) => {
    onPayPeriodFrequencyChange(value as PayPeriodFrequency)
  }

  const handleWithholdingRateChange = (value: string) => {
    onWithholdingRateChange(value as WithholdingType)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onCancel}>
            {t('modal.cancelButton')}
          </Button>
          <Button variant="primary" onClick={onDone}>
            {t('modal.doneButton')}
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <Heading as="h2" styledAs="h3">
          {t('modal.title')}
        </Heading>

        <div className={styles.section}>
          <Heading as="h3" styledAs="h4">
            {t('modal.regularSection.title')}
          </Heading>
          <Text variant="supporting">{t('modal.regularSection.subtitle')}</Text>

          <div className={styles.rateInfo}>
            <Text weight="semibold">{t('modal.regularSection.rateLabel')}</Text>
            <Text variant="supporting">{t('modal.regularSection.rateDescription')}</Text>
          </div>

          <Select
            label={t('modal.regularSection.rateLabel')}
            options={frequencyOptions}
            value={config.payPeriodFrequency}
            onChange={handlePayPeriodChange}
            shouldVisuallyHideLabel
          />
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <Heading as="h3" styledAs="h4">
            {t('modal.supplementalSection.title')}
          </Heading>
          <RadioGroup
            label={t('modal.supplementalSection.title')}
            options={withholdingRateOptions}
            value={config.withholdingRate}
            onChange={handleWithholdingRateChange}
            shouldVisuallyHideLabel
          />
        </div>
      </div>
    </Modal>
  )
}
