import { useTranslation } from 'react-i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'

interface PaymentSummary {
  totalAmount: number
  debitAmount: number
  debitAccount: string
  debitDate: string
  contractorPayDate: string
  checkDate: string
  submitByDate: string
}

interface ContractorData {
  id: string
  name: string
  wageType: 'Fixed' | 'Hourly'
  hourlyRate?: number
  paymentMethod: 'Direct Deposit' | 'Check' | 'Historical Payment'
  hours: number
  wage: number
  bonus: number
  reimbursement: number
  total: number
}

interface ContractorPaymentOverviewPresentationProps {
  paymentSummary: PaymentSummary
  contractors: ContractorData[]
  onEdit: () => void
  onSubmit: () => void
}

export const OverviewPresentation = ({
  paymentSummary,
  contractors,
  onEdit,
  onSubmit,
}: ContractorPaymentOverviewPresentationProps) => {
  const { Button, Text, Heading } = useComponentContext()
  useI18n('ContractorPayment.ContractorPaymentOverview')
  const { t } = useTranslation('ContractorPayment.ContractorPaymentOverview')

  const formatCurrency = useNumberFormatter('currency')

  const formatWageType = (contractor: ContractorData) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `Hourly ${formatCurrency(contractor.hourlyRate)}/hr`
    }
    return contractor.wageType
  }

  const calculateWageAmount = (contractor: ContractorData) => {
    if (contractor.wageType === 'Hourly') {
      return contractor.hours * (contractor.hourlyRate || 0)
    }
    return contractor.wage
  }

  const totals = contractors.reduce(
    (acc, contractor) => ({
      wage: acc.wage + calculateWageAmount(contractor),
      bonus: acc.bonus + contractor.bonus,
      reimbursement: acc.reimbursement + contractor.reimbursement,
      total: acc.total + contractor.total,
    }),
    { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
  )

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h1">{t('title')}</Heading>
        <Heading as="h2">{t('reviewAndSubmitTitle')}</Heading>
        <Text>{t('reviewSubtitle', { submitByDate: paymentSummary.submitByDate })}</Text>
      </Flex>

      {/* Payment Summary */}
      <Flex flexDirection="column" gap={16}>
        <DataView
          columns={[
            {
              title: t('summaryTableHeaders.totalAmount'),
              render: () => <Text>{formatCurrency(paymentSummary.totalAmount)}</Text>,
            },
            {
              title: t('summaryTableHeaders.debitAmount'),
              render: () => <Text>{formatCurrency(paymentSummary.debitAmount)}</Text>,
            },
            {
              title: t('summaryTableHeaders.debitAccount'),
              render: () => <Text>{paymentSummary.debitAccount}</Text>,
            },
            {
              title: t('summaryTableHeaders.debitDate'),
              render: () => <Text>{paymentSummary.debitDate}</Text>,
            },
            {
              title: t('summaryTableHeaders.contractorPayDate'),
              render: () => <Text>{paymentSummary.contractorPayDate}</Text>,
            },
          ]}
          data={[paymentSummary]}
          label="Payment Summary"
        />
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('whatYourCompanyPays')}</Heading>
          <Text variant="supporting">
            {t('dateLabel')}: {paymentSummary.checkDate}
          </Text>
        </Flex>

        {/* Contractor Payments Table with Integrated Totals */}
        <div style={{ width: '100%' }}>
          <DataView
            columns={[
              {
                title: t('contractorTableHeaders.contractor'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals' ? (
                      <strong>{contractor.name}</strong>
                    ) : (
                      contractor.name
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.wageType'),
                render: contractor => (
                  <Text>{contractor.id === 'totals' ? '' : formatWageType(contractor)}</Text>
                ),
              },
              {
                title: t('contractorTableHeaders.paymentMethod'),
                render: contractor => (
                  <Text>{contractor.id === 'totals' ? '' : contractor.paymentMethod}</Text>
                ),
              },
              {
                title: t('contractorTableHeaders.hours'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals'
                      ? ''
                      : contractor.wageType === 'Hourly'
                        ? contractor.hours.toFixed(3)
                        : '0.000'}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.wage'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals' ? (
                      <strong>{formatCurrency(contractor.wage)}</strong>
                    ) : (
                      formatCurrency(calculateWageAmount(contractor))
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.bonus'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals' ? (
                      <strong>{formatCurrency(contractor.bonus)}</strong>
                    ) : (
                      formatCurrency(contractor.bonus)
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.reimbursement'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals' ? (
                      <strong>{formatCurrency(contractor.reimbursement)}</strong>
                    ) : (
                      formatCurrency(contractor.reimbursement)
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.total'),
                render: contractor => (
                  <Text>
                    {contractor.id === 'totals' ? (
                      <strong>{formatCurrency(contractor.total)}</strong>
                    ) : (
                      formatCurrency(contractor.total)
                    )}
                  </Text>
                ),
              },
            ]}
            data={[
              ...contractors,
              {
                id: 'totals',
                name: t('totalsLabel'),
                wageType: 'Fixed' as const,
                paymentMethod: 'Direct Deposit' as const,
                hours: 0,
                wage: totals.wage,
                bonus: totals.bonus,
                reimbursement: totals.reimbursement,
                total: totals.total,
              },
            ]}
            label={t('whatYourCompanyPays')}
          />
        </div>
      </Flex>

      <Flex justifyContent="flex-end" gap={16}>
        <Button onClick={onEdit} variant="secondary">
          {t('editButton')}
        </Button>
        <Button onClick={onSubmit} variant="primary">
          {t('submitButton')}
        </Button>
      </Flex>
    </Flex>
  )
}
