import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import type { InternalAlert } from '../types'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { ConfirmWireDetails } from '@/components/Payroll/ConfirmWireDetails'
import type { EventType } from '@/shared/constants'

const ZERO_HOURS_DISPLAY = '0.000'

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
  const currencyFormatter = useNumberFormatter()

  const formatWageType = (contractor: ContractorPaymentForGroup) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `Hourly ${currencyFormatter(Number(contractor.hourlyRate))}/hr`
    }
    return contractor.wageType
  }

  const contractorPayments = contractorPaymentGroup.contractorPayments || []

  const totals = useMemo(() => {
    if (contractorPayments.length === 0) {
      return { wageAmount: 0, bonusAmount: 0, reimbursementAmount: 0, totalAmount: 0 }
    }
    return contractorPayments.reduce(
      (acc, contractor) => {
        acc.wageAmount += Number(contractor.wage || '0')
        acc.bonusAmount += Number(contractor.bonus || '0')
        acc.reimbursementAmount += Number(contractor.reimbursement || '0')
        acc.totalAmount += Number(contractor.wageTotal || '0')
        return acc
      },
      { wageAmount: 0, bonusAmount: 0, reimbursementAmount: 0, totalAmount: 0 },
    )
  }, [contractorPayments])

  return (
    <Flex flexDirection="column" gap={16}>
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

      {/* Payment Summary Table */}
      <DataView
        columns={[
          {
            title: t('totalAmount'),
            render: () => currencyFormatter(Number(contractorPaymentGroup.totals?.amount || '0')),
          },
          {
            title: t('debitAmount'),
            render: () =>
              currencyFormatter(Number(contractorPaymentGroup.totals?.debitAmount || '0')),
          },
          {
            title: t('debitAccount'),
            render: () => bankAccount?.hiddenAccountNumber ?? t('notAvailable'),
          },
          {
            title: t('debitDate'),
            render: () => contractorPaymentGroup.debitDate || t('notAvailable'),
          },
          {
            title: t('contractorPayDate'),
            render: () => contractorPaymentGroup.checkDate || t('notAvailable'),
          },
        ]}
        data={[contractorPaymentGroup]}
        label={t('paymentSummaryTitle')}
      />

      {/* Contractor Payments Table */}
      {contractorPayments.length > 0 && (
        <DataView
          columns={[
            {
              title: t('contractor'),
              render: contractorPayment =>
                getContractorDisplayName(
                  contractors.find(
                    contractor => contractor.uuid === contractorPayment.contractorUuid,
                  ),
                ),
            },
            {
              title: t('wageType'),
              render: contractorPayment => formatWageType(contractorPayment),
            },
            {
              title: t('paymentMethod'),
              render: contractorPayment =>
                contractorPayment.paymentMethod === 'Direct Deposit'
                  ? t('paymentMethods.directDeposit')
                  : contractorPayment.paymentMethod === 'Check'
                    ? t('paymentMethods.check')
                    : contractorPayment.paymentMethod || t('notAvailable'),
            },
            {
              title: t('hours'),
              render: contractorPayment =>
                contractorPayment.wageType === 'Hourly' && contractorPayment.hours
                  ? formatHoursDisplay(parseFloat(contractorPayment.hours))
                  : ZERO_HOURS_DISPLAY,
            },
            {
              title: t('wage'),
              render: contractorPayment => currencyFormatter(Number(contractorPayment.wage || '0')),
            },
            {
              title: t('bonus'),
              render: contractorPayment =>
                currencyFormatter(Number(contractorPayment.bonus || '0')),
            },
            {
              title: t('reimbursement'),
              render: contractorPayment =>
                currencyFormatter(Number(contractorPayment.reimbursement || '0')),
            },
            {
              title: t('total'),
              render: contractorPayment =>
                currencyFormatter(Number(contractorPayment.wageTotal || '0')),
            },
          ]}
          data={contractorPayments}
          footer={() => ({
            'column-0': t('totalsLabel'),
            'column-4': currencyFormatter(totals.wageAmount || 0),
            'column-5': currencyFormatter(totals.bonusAmount || 0),
            'column-6': currencyFormatter(totals.reimbursementAmount || 0),
            'column-7': currencyFormatter(totals.totalAmount || 0),
          })}
          label={t('contractorPaymentsTitle')}
        />
      )}
    </Flex>
  )
}
