import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from './helpers'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'

const ZERO_HOURS_DISPLAY = '0.000'

interface HistoricalPaymentSuccessPresentationProps {
  contractorPaymentGroup: ContractorPaymentGroup
  contractors: Contractor[]
  onDone: () => void
}

export const HistoricalPaymentSuccessPresentation = ({
  contractorPaymentGroup,
  contractors,
  onDone,
}: HistoricalPaymentSuccessPresentationProps) => {
  const { Button, Text, Heading, Alert } = useComponentContext()
  useI18n('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment')
  const { t } = useTranslation('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment', {
    keyPrefix: 'successPresentation',
  })
  const currencyFormatter = useNumberFormatter()

  const formatWageType = (contractor: ContractorPaymentForGroup) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `${t('wageTypes.hourly')} ${currencyFormatter(Number(contractor.hourlyRate || '0'))}${t('perHour')}`
    }
    return contractor.wageType
  }

  const contractorPayments = contractorPaymentGroup.contractorPayments || []

  const totals = useMemo(
    () =>
      contractorPayments.reduce(
        (acc, contractor) => {
          acc.wageAmount += Number(contractor.wage || '0')
          acc.bonusAmount += Number(contractor.bonus || '0')
          acc.reimbursementAmount += Number(contractor.reimbursement || '0')
          acc.totalAmount += Number(contractor.wageTotal || '0')
          return acc
        },
        { wageAmount: 0, bonusAmount: 0, reimbursementAmount: 0, totalAmount: 0 },
      ),
    [contractorPayments],
  )

  return (
    <Flex flexDirection="column" gap={32}>
      <Alert status="success" label={t('successTitle')}>
        <Text>
          {t('successMessage', {
            count: contractorPayments.length,
          })}
        </Text>
      </Alert>

      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={2}>
          <Heading as="h2">{t('summaryTitle')}</Heading>
          <Text variant="supporting">
            {t('summarySubtitle', { checkDate: contractorPaymentGroup.checkDate })}
          </Text>
        </Flex>
        <Button onClick={onDone} variant="primary">
          {t('doneCta')}
        </Button>
      </Flex>

      <DataView
        columns={[
          {
            title: t('summaryTableHeaders.totalAmount'),
            render: () => (
              <Text>{currencyFormatter(Number(contractorPaymentGroup.totals?.amount || '0'))}</Text>
            ),
          },
          {
            title: t('summaryTableHeaders.contractorPayDate'),
            render: () => <Text>{contractorPaymentGroup.checkDate || ''}</Text>,
          },
        ]}
        data={[contractorPaymentGroup]}
        label="Payment Summary"
      />

      {contractorPayments.length > 0 && (
        <DataView
          columns={[
            {
              title: t('contractorTableHeaders.contractor'),
              render: contractorPayment => (
                <Text>
                  {getContractorDisplayName(
                    contractors.find(
                      contractor => contractor.uuid === contractorPayment.contractorUuid,
                    ),
                  )}
                </Text>
              ),
            },
            {
              title: t('contractorTableHeaders.wageType'),
              render: contractorPayment => <Text>{formatWageType(contractorPayment)}</Text>,
            },
            {
              title: t('contractorTableHeaders.hours'),
              render: contractorPayment => {
                const hours = Number(contractorPayment.hours || '0')
                return (
                  <Text>
                    {contractorPayment.wageType === 'Hourly' && hours
                      ? formatHoursDisplay(hours)
                      : ZERO_HOURS_DISPLAY}
                  </Text>
                )
              },
            },
            {
              title: t('contractorTableHeaders.wage'),
              render: contractorPayment => (
                <Text>{currencyFormatter(Number(contractorPayment.wage || '0'))}</Text>
              ),
            },
            {
              title: t('contractorTableHeaders.bonus'),
              render: contractorPayment => (
                <Text>{currencyFormatter(Number(contractorPayment.bonus || '0'))}</Text>
              ),
            },
            {
              title: t('contractorTableHeaders.reimbursement'),
              render: contractorPayment => (
                <Text>{currencyFormatter(Number(contractorPayment.reimbursement || '0'))}</Text>
              ),
            },
            {
              title: t('contractorTableHeaders.total'),
              render: contractorPayment => (
                <Text>{currencyFormatter(Number(contractorPayment.wageTotal || '0'))}</Text>
              ),
            },
          ]}
          data={contractorPayments}
          footer={() => ({
            'column-0': <Text weight="bold">{t('totalsLabel')}</Text>,
            'column-3': <Text>{currencyFormatter(totals.wageAmount || 0)}</Text>,
            'column-4': <Text>{currencyFormatter(totals.bonusAmount || 0)}</Text>,
            'column-5': <Text>{currencyFormatter(totals.reimbursementAmount || 0)}</Text>,
            'column-6': <Text>{currencyFormatter(totals.totalAmount || 0)}</Text>,
          })}
          label="Contractor Payments"
        />
      )}
    </Flex>
  )
}
