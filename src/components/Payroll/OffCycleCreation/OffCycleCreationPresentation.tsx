import { useTranslation } from 'react-i18next'
import { OffCycleReasonSelectionPresentation } from '../OffCycleReasonSelection'
import { OffCyclePayPeriodDateFormPresentation } from '../OffCyclePayPeriodDateForm/OffCyclePayPeriodDateFormPresentation'
import type { OffCycleCreationPresentationProps } from './OffCycleCreationTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export function OffCycleCreationPresentation({ isPending }: OffCycleCreationPresentationProps) {
  useI18n('Payroll.OffCycleCreation')
  const { t } = useTranslation('Payroll.OffCycleCreation')
  const { Heading, Text, Button } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <OffCyclePayPeriodDateFormPresentation />
      </Flex>

      <Flex flexDirection="column" gap={20}>
        <OffCycleReasonSelectionPresentation name="reason" />
      </Flex>

      {/* TODO: EmployeeSelection section — will compose EmployeeSelectionPresentation */}

      {/* TODO: Deductions section — will compose DeductionsPresentation */}

      {/* TODO: TaxWithholdingRates section — will compose TaxWithholdingRatesPresentation */}

      <Flex justifyContent="flex-end" gap={12}>
        <Button type="submit" isLoading={isPending} isDisabled={isPending}>
          {t('continueCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
