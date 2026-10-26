import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OffCycleTaxWithholdingTable } from '../OffCycleTaxWithholdingTable'
import { OffCycleTaxWithholdingModal } from '../OffCycleTaxWithholdingModal'
import type {
  OffCycleTaxWithholdingConfig,
  WageTypeGroup,
} from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { TransitionConfigurationPresentationProps } from './TransitionConfigurationTypes'
import styles from './TransitionConfigurationPresentation.module.scss'
import type { DescriptionListItem } from '@/components/Common/UI/DescriptionList/DescriptionListTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/**
 * Presentational layout for the transition payroll configuration form.
 *
 * @param props - {@link TransitionConfigurationPresentationProps}.
 * @returns The transition payroll configuration form layout.
 * @internal
 */
export function TransitionConfigurationPresentation({
  className,
  payPeriodStartDate,
  payPeriodEndDate,
  payScheduleName,
  checkDate,
  deductionsField,
  taxWithholdingConfig,
  onTaxWithholdingChange,
  isPending,
}: TransitionConfigurationPresentationProps) {
  useI18n('Payroll.TransitionConfiguration')
  const { t } = useTranslation('Payroll.TransitionConfiguration')
  const { Heading, Text, Alert, Button, DescriptionList } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [isTaxWithholdingModalOpen, setIsTaxWithholdingModalOpen] = useState(false)

  const wageTypeGroups: WageTypeGroup[] = [
    {
      category: 'regular',
      label: t('wageTypeGroups.regular.label'),
      description: t('wageTypeGroups.regular.description'),
    },
    {
      category: 'supplemental',
      label: t('wageTypeGroups.supplemental.label'),
      description: t('wageTypeGroups.supplemental.description'),
    },
    {
      category: 'reimbursement',
      label: t('wageTypeGroups.reimbursement.label'),
    },
  ]

  const detailItems: DescriptionListItem[] = [
    {
      term: <Text weight="bold">{t('payPeriodLabel')}</Text>,
      description: (
        <Text>
          {dateFormatter.formatShortWithYear(payPeriodStartDate)} -{' '}
          {dateFormatter.formatShortWithYear(payPeriodEndDate)}
        </Text>
      ),
    },
  ]
  if (payScheduleName) {
    detailItems.push({
      term: <Text weight="bold">{t('payScheduleLabel')}</Text>,
      description: <Text>{payScheduleName}</Text>,
    })
  }
  if (checkDate) {
    detailItems.push({
      term: <Text weight="bold">{t('checkDateLabel')}</Text>,
      description: <Text>{dateFormatter.formatShortWithYear(checkDate)}</Text>,
    })
  }

  const handleTaxWithholdingModalDone = (config: OffCycleTaxWithholdingConfig) => {
    onTaxWithholdingChange(config)
    setIsTaxWithholdingModalOpen(false)
  }

  return (
    <Flex className={className} flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Alert status="info" label={t('transitionExplanation')} />

      <hr className={styles.divider} />

      <Flex flexDirection="column" gap={16}>
        <Heading as="h3">{t('detailsHeading')}</Heading>

        <DescriptionList showSeparators={false} items={detailItems} />
      </Flex>

      <hr className={styles.divider} />

      <Flex flexDirection="column" gap={20}>
        {deductionsField}
      </Flex>

      <hr className={styles.divider} />

      <OffCycleTaxWithholdingTable
        wageTypeGroups={wageTypeGroups}
        config={taxWithholdingConfig}
        onEditClick={() => {
          setIsTaxWithholdingModalOpen(true)
        }}
      />
      {isTaxWithholdingModalOpen && (
        <OffCycleTaxWithholdingModal
          isOpen
          defaultConfig={taxWithholdingConfig}
          onDone={handleTaxWithholdingModalDone}
          onCancel={() => {
            setIsTaxWithholdingModalOpen(false)
          }}
        />
      )}

      <Flex justifyContent="flex-end" gap={12}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('continueCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
