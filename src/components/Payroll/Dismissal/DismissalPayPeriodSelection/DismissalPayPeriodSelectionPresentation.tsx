import { useTranslation } from 'react-i18next'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import type { SelectOption } from '@/components/Common/UI/Select/SelectTypes'

/** @internal */
export interface DismissalPayPeriodSelectionPresentationProps {
  /** Pay period options to display in the select. */
  payPeriodOptions: SelectOption[]
  /** Key of the currently selected pay period option, or undefined when none is selected. */
  selectedPeriodKey: string | undefined
  /** Called when the user selects a pay period from the options. */
  onSelectPeriod: (value: string) => void
  /** Called when the user clicks the continue button. */
  onSubmit: () => void
  /** Whether the submit action is in flight. */
  isPending: boolean
}

/** @internal */
export function DismissalPayPeriodSelectionPresentation({
  payPeriodOptions,
  selectedPeriodKey,
  onSelectPeriod,
  onSubmit,
  isPending,
}: DismissalPayPeriodSelectionPresentationProps) {
  useI18n('Payroll.Dismissal')
  const { t } = useTranslation('Payroll.Dismissal')
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
        value={selectedPeriodKey}
        onChange={onSelectPeriod}
        placeholder={t('selectPlaceholder')}
        isRequired
      />

      <ActionsLayout>
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={isPending}
          isDisabled={isPending || selectedPeriodKey === undefined}
        >
          {t('continueCta')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
