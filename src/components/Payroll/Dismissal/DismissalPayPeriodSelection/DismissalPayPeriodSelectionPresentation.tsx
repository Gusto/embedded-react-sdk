import { useTranslation } from 'react-i18next'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'

export interface DismissalPayPeriodSelectionPresentationProps {
  payPeriodOptions: SelectOption[]
  selectedPeriodIndex: string | undefined
  onSelectPeriod: (value: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function DismissalPayPeriodSelectionPresentation({
  payPeriodOptions,
  selectedPeriodIndex,
  onSelectPeriod,
  onSubmit,
  isPending,
}: DismissalPayPeriodSelectionPresentationProps) {
  useI18n('Payroll.DismissalPayPeriodSelection')
  const { t } = useTranslation('Payroll.DismissalPayPeriodSelection')
  const { Heading, Text, Select, Button, Alert } = useComponentContext()

  const hasNoPayPeriods = payPeriodOptions.length === 0

  if (hasNoPayPeriods) {
    return (
      <Flex flexDirection="column" gap={24}>
        <Flex flexDirection="column" gap={4}>
          <Heading as="h2">{t('pageTitle')}</Heading>
        </Flex>
        <Alert status="info" label={t('emptyState')} />
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('pageTitle')}</Heading>
        <Text variant="supporting">{t('pageDescription')}</Text>
      </Flex>

      <Select
        label={t('selectLabel')}
        options={payPeriodOptions}
        value={selectedPeriodIndex}
        onChange={onSelectPeriod}
        placeholder={t('selectPlaceholder')}
      />

      <ActionsLayout>
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={isPending}
          isDisabled={isPending || selectedPeriodIndex === undefined}
        >
          {t('continueCta')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
