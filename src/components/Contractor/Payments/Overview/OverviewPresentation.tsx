import { useTranslation } from 'react-i18next'
import type { ContractorPaymentForGroup, ContractorPaymentGroup } from '../types'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { formatHoursDisplay } from '@/components/Payroll/helpers'

const ZERO_HOURS_DISPLAY = '0.000'

interface PaymentSummary {
  totalAmount: string
  debitAmount: string
  debitAccount: string
  debitDate: string
  contractorPayDate: string
  checkDate: string
  submitByDate: string
}

interface ContractorPaymentOverviewPresentationProps {
  paymentSummary: PaymentSummary
  contractorPaymentGroup: ContractorPaymentGroup
  onEdit: () => void
  onSubmit: () => void
}

export const OverviewPresentation = ({
  paymentSummary,
  contractorPaymentGroup,
  onEdit,
  onSubmit,
}: ContractorPaymentOverviewPresentationProps) => {
  const { Button, Text, Heading } = useComponentContext()
  useI18n('Contractor.Payments.Overview')
  const { t } = useTranslation('Contractor.Payments.Overview')
  const { locale } = useLocale()

  const formatWageType = (contractor: ContractorPaymentForGroup) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `${t('wageTypes.hourly')} ${formatNumberAsCurrency(parseFloat(contractor.hourlyRate), locale)}${t('perHour')}`
    }
    return contractor.wageType
  }

  const contractors: ContractorPaymentForGroup[] = contractorPaymentGroup.contractorPayments || []

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
              render: () => (
                <Text>
                  {formatNumberAsCurrency(
                    parseFloat(contractorPaymentGroup.totals?.amount || '0'),
                    locale,
                  )}
                </Text>
              ),
            },
            {
              title: t('summaryTableHeaders.debitAmount'),
              render: () => (
                <Text>
                  {formatNumberAsCurrency(
                    parseFloat(contractorPaymentGroup.totals?.debitAmount || '0'),
                    locale,
                  )}
                </Text>
              ),
            },
            {
              title: t('summaryTableHeaders.debitAccount'),
              render: () => <Text>{paymentSummary.debitAccount}</Text>,
            },
            {
              title: t('summaryTableHeaders.debitDate'),
              render: () => (
                <Text>{contractorPaymentGroup.debitDate || paymentSummary.debitDate}</Text>
              ),
            },
            {
              title: t('summaryTableHeaders.contractorPayDate'),
              render: () => (
                <Text>{contractorPaymentGroup.checkDate || paymentSummary.contractorPayDate}</Text>
              ),
            },
          ]}
          data={[contractorPaymentGroup]}
          label="Payment Summary"
        />
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('whatYourCompanyPays')}</Heading>
          <Text variant="supporting">
            {t('dateLabel')}: {contractorPaymentGroup.checkDate}
          </Text>
        </Flex>

        {/* Contractor Payments Table */}
        <div style={{ width: '100%' }}>
          <DataView
            columns={[
              {
                title: t('contractorTableHeaders.contractor'),
                render: contractor => <Text>{contractor.contractorUuid || 'N/A'}</Text>,
              },
              {
                title: t('contractorTableHeaders.wageType'),
                render: contractor => <Text>{formatWageType(contractor)}</Text>,
              },
              {
                title: t('contractorTableHeaders.paymentMethod'),
                render: contractor => <Text>{contractor.paymentMethod || 'N/A'}</Text>,
              },
              {
                title: t('contractorTableHeaders.hours'),
                render: contractor => (
                  <Text>
                    {contractor.wageType === 'Hourly' && contractor.hours
                      ? formatHoursDisplay(parseFloat(contractor.hours))
                      : ZERO_HOURS_DISPLAY}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.wage'),
                render: contractor => (
                  <Text>
                    {contractor.wageType === 'Fixed' && contractor.wage
                      ? formatNumberAsCurrency(parseFloat(contractor.wage), locale)
                      : formatNumberAsCurrency(0, locale)}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.bonus'),
                render: contractor => (
                  <Text>
                    {formatNumberAsCurrency(
                      contractor.bonus ? parseFloat(contractor.bonus) : 0,
                      locale,
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.reimbursement'),
                render: contractor => (
                  <Text>
                    {formatNumberAsCurrency(
                      contractor.reimbursement ? parseFloat(contractor.reimbursement) : 0,
                      locale,
                    )}
                  </Text>
                ),
              },
              {
                title: t('contractorTableHeaders.total'),
                render: contractor => (
                  <Text>
                    {formatNumberAsCurrency(
                      contractor.wageTotal ? parseFloat(contractor.wageTotal) : 0,
                      locale,
                    )}
                  </Text>
                ),
              },
            ]}
            data={contractors}
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
