import { useTranslation } from 'react-i18next'
import { useContractorPaymentGroupsGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGet'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { PaymentSummaryBlock } from '../shared/PaymentSummaryBlock'
import { useHistoricalPaymentSummaryDictionary } from './useFormDictionary'
import { Flex } from '@/components/Common'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { useRequiredUnstableFeatures } from '@/contexts/UnstableFeaturesProvider/useUnstableFeatures'

/**
 * Props for {@link HistoricalPaymentSummary}.
 *
 * @alpha
 */
export interface HistoricalPaymentSummaryProps extends BaseComponentInterface<'Contractor.Payments.HistoricalPaymentSummary'> {
  /** UUID of the historical contractor payment group to summarize. */
  paymentGroupId: string
  /** UUID of the company that owns the payment group. */
  companyId: string
}

/**
 * Displays the summary of a successfully recorded historical contractor payment.
 *
 * @remarks
 * Fetches the created contractor payment group by ID and renders a per-contractor breakdown.
 * Historical payments don't move money, so unlike `PaymentSummary` there is no debit account,
 * debit date, or wire-transfer confirmation to show.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/exit` | User is done reviewing the summary. | — |
 *
 * @param props - See {@link HistoricalPaymentSummaryProps}.
 * @returns The rendered payment summary, or `null` when the payment group cannot be loaded.
 * @alpha
 */
export function HistoricalPaymentSummary(props: HistoricalPaymentSummaryProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.HistoricalPaymentSummary">
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ paymentGroupId, companyId, dictionary, onEvent }: HistoricalPaymentSummaryProps) {
  useRequiredUnstableFeatures('historicalPayments')
  useI18n('Contractor.Payments.HistoricalPaymentSummary')
  useComponentDictionary('Contractor.Payments.HistoricalPaymentSummary', dictionary)
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentSummary')
  const { Heading, Text, Button, Alert } = useComponentContext()
  const { formatLongWithYear } = useDateFormatter()
  const summaryDictionary = useHistoricalPaymentSummaryDictionary()

  const { data: paymentGroupData } = useContractorPaymentGroupsGetSuspense({
    contractorPaymentGroupUuid: paymentGroupId,
  })
  const contractorPaymentGroup = paymentGroupData.contractorPaymentGroup

  const { data: contractorList } = useContractorsListSuspense({ companyUuid: companyId })
  const contractors = (contractorList.contractors || []).filter(
    contractor =>
      contractor.isActive &&
      contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED,
  )

  if (!contractorPaymentGroup) {
    return null
  }

  const handleDone = () => {
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Alert status="success" label={t('successTitle')}>
        <Text>
          {t('successMessage', {
            count: contractorPaymentGroup.contractorPayments?.length ?? 0,
          })}
        </Text>
      </Alert>

      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('summaryTitle')}</Heading>
          <Text variant="supporting">
            {t('summarySubtitle', {
              checkDate: formatLongWithYear(contractorPaymentGroup.checkDate ?? ''),
            })}
          </Text>
        </Flex>
        <Button onClick={handleDone} variant="primary">
          {t('doneCta')}
        </Button>
      </Flex>

      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        showDebitColumns={false}
        dictionary={summaryDictionary}
      />
    </Flex>
  )
}
