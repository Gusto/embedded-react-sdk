import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import styles from './OffCycleTaxWithholdingModal.module.scss'
import type { OffCycleTaxWithholdingModalProps } from './OffCycleTaxWithholdingModalTypes'
import { SelectField, RadioGroupField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const WITHHOLDING_PAY_PERIOD_I18N_KEY = {
  [WithholdingPayPeriod.EveryWeek]: 'payPeriodFrequency.everyWeek',
  [WithholdingPayPeriod.EveryOtherWeek]: 'payPeriodFrequency.everyOtherWeek',
  [WithholdingPayPeriod.TwicePerMonth]: 'payPeriodFrequency.twicePerMonth',
  [WithholdingPayPeriod.Monthly]: 'payPeriodFrequency.monthly',
  [WithholdingPayPeriod.Quarterly]: 'payPeriodFrequency.quarterly',
  [WithholdingPayPeriod.Semiannually]: 'payPeriodFrequency.semiannually',
  [WithholdingPayPeriod.Annually]: 'payPeriodFrequency.annually',
} as const

export function OffCycleTaxWithholdingModal({
  isOpen,
  defaultConfig,
  onDone,
  onCancel,
}: OffCycleTaxWithholdingModalProps) {
  useI18n('Payroll.OffCycleTaxWithholding')
  const { t } = useTranslation('Payroll.OffCycleTaxWithholding')
  const { Modal, Heading, Text, Button } = useComponentContext()

  const formHandlers = useForm<OffCycleTaxWithholdingConfig>({
    defaultValues: defaultConfig,
  })

  const currentWithholdingPayPeriod = useWatch({
    control: formHandlers.control,
    name: 'withholdingPayPeriod',
  })

  const frequencyOptions = useMemo(
    () =>
      Object.values(WithholdingPayPeriod).map(value => ({
        value,
        label: t(WITHHOLDING_PAY_PERIOD_I18N_KEY[value]),
      })),
    [t],
  )

  const frequencyDisplayText = t(
    WITHHOLDING_PAY_PERIOD_I18N_KEY[currentWithholdingPayPeriod],
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

  const handleSubmit = formHandlers.handleSubmit(onDone)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onCancel}>
            {t('modal.cancelButton')}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t('modal.doneButton')}
          </Button>
        </div>
      }
    >
      <FormProvider {...formHandlers}>
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

            <SelectField
              name="withholdingPayPeriod"
              label={t('modal.regularSection.rateLabel')}
              options={frequencyOptions}
              shouldVisuallyHideLabel
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.section}>
            <Heading as="h3" styledAs="h4">
              {t('modal.supplementalSection.title')}
            </Heading>
            <RadioGroupField
              name="withholdingRate"
              label={t('modal.supplementalSection.title')}
              options={withholdingRateOptions}
              shouldVisuallyHideLabel
            />
          </div>
        </div>
      </FormProvider>
    </Modal>
  )
}
