import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import type { InternalAlert } from '../types'
import { PaymentSummaryBlock } from '../shared/PaymentSummaryBlock'
import { usePaymentSummaryDictionary } from './useFormDictionary'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { ConfirmWireDetails } from '@/components/Payroll/ConfirmWireDetails'
import type { EventType } from '@/shared/constants'

interface PaymentSummaryPresentationProps {
  contractorPaymentGroup: ContractorPaymentGroup
  contractors: Contractor[]
  bankAccount?: CompanyBankAccount
  companyId: string
  wireInRequestUuid?: string
  onEvent: (type: EventType, data?: unknown) => void
  onDone: () => void
  alerts?: InternalAlert[]
}

/** @internal */
export const PaymentSummaryPresentation = ({
  contractorPaymentGroup,
  contractors,
  bankAccount,
  companyId,
  wireInRequestUuid,
  onEvent,
  onDone,
  alerts = [],
}: PaymentSummaryPresentationProps) => {
  const { Button, Text, Heading, Alert } = useComponentContext()
  useI18n('Contractor.Payments.PaymentSummary')
  const { t } = useTranslation('Contractor.Payments.PaymentSummary')
  const dictionary = usePaymentSummaryDictionary()

  const contractorPayments = contractorPaymentGroup.contractorPayments || []

  return (
    <Flex flexDirection="column" gap={24}>
      {alerts.length > 0 && (
        <Flex flexDirection="column" gap={16}>
          {alerts.map((alert, index) => (
            <Alert
              key={`${alert.type}-${alert.title}-${index}`}
              label={t(`alerts.${alert.title}` as never, alert.translationParams)}
              status={alert.type}
              onDismiss={alert.onDismiss}
            >
              {typeof alert.content === 'string'
                ? t(`alerts.${alert.content}` as never)
                : (alert.content ?? null)}
            </Alert>
          ))}
        </Flex>
      )}

      <Alert status="success" label={t('successTitle')}>
        <Text>
          {t('successMessage', {
            count: contractorPayments.length,
          })}
        </Text>
      </Alert>

      {wireInRequestUuid && (
        <ConfirmWireDetails companyId={companyId} wireInId={wireInRequestUuid} onEvent={onEvent} />
      )}

      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('summaryTitle')}</Heading>
          <Text variant="supporting">
            {t('summarySubtitle', { debitDate: contractorPaymentGroup.debitDate })}
          </Text>
        </Flex>
        <Button onClick={onDone} variant="primary">
          {t('doneCta')}
        </Button>
      </Flex>

      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        bankAccount={bankAccount}
        dictionary={dictionary}
      />
    </Flex>
  )
}
