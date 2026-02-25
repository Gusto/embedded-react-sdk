import { Trans, useTranslation } from 'react-i18next'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import styles from './PaymentHistoryPresentation.module.scss'
import { DataView, Flex, EmptyData } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import EyeIcon from '@/assets/icons/eye.svg?react'
import CancelIcon from '@/assets/icons/slash-circle.svg?react'

interface PaymentHistoryPresentationProps {
  paymentGroup: ContractorPaymentGroup
  contractors: Contractor[]
  onViewPayment: (paymentId: string) => void
  onCancelPayment: (paymentId: string) => void
  isCancelling: boolean
}

export const PaymentHistoryPresentation = ({
  paymentGroup,
  contractors,
  onViewPayment,
  onCancelPayment,
  isCancelling,
}: PaymentHistoryPresentationProps) => {
  const { Text, Heading } = useComponentContext()
  useI18n('Contractor.Payments.PaymentHistory')
  const { t } = useTranslation('Contractor.Payments.PaymentHistory')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatLongWithYear } = useDateFormatter()

  const payments = paymentGroup.contractorPayments || []

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={8}>
        <Heading as="h2">{t('title')}</Heading>
        <Text>
          <Trans
            i18nKey={'subtitle'}
            t={t}
            values={{ date: formatLongWithYear(paymentGroup.debitDate) }}
            components={{
              strong: <Text weight="bold" as="span" />,
            }}
          />
        </Text>
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('paymentsSection')}</Heading>

        {payments.length === 0 ? (
          <EmptyData title={t('noPaymentsFound')} description={t('noPaymentsDescription')} />
        ) : (
          <>
            <DataView
              columns={[
                {
                  title: t('tableHeaders.contractor'),
                  render: ({ contractorUuid }) =>
                    getContractorDisplayName(
                      contractors.find(contractor => contractor.uuid === contractorUuid),
                    ),
                },
                {
                  title: t('tableHeaders.wageType'),
                  render: ({ wageType }) => <Text>{wageType}</Text>,
                },
                {
                  title: t('tableHeaders.paymentMethod'),
                  render: ({ paymentMethod }) => <Text>{paymentMethod}</Text>,
                },
                {
                  title: t('tableHeaders.hours'),
                  render: ({ hours }) => (
                    <Text>{hours ? formatHoursDisplay(Number(hours)) : '–'}</Text>
                  ),
                },
                {
                  title: t('tableHeaders.wage'),
                  render: ({ wage }) => <Text>{wage ? currencyFormatter(Number(wage)) : '–'}</Text>,
                },
                {
                  title: t('tableHeaders.bonus'),
                  render: ({ bonus }) => (
                    <Text>{bonus ? currencyFormatter(Number(bonus)) : '–'}</Text>
                  ),
                },
                {
                  title: t('tableHeaders.reimbursements'),
                  render: ({ reimbursement }) => (
                    <Text>{reimbursement ? currencyFormatter(Number(reimbursement)) : '–'}</Text>
                  ),
                },
                {
                  title: t('tableHeaders.total'),
                  render: ({ wageTotal, reimbursement, bonus }) => (
                    <Text>
                      {wageTotal
                        ? currencyFormatter(
                            Number(wageTotal) + Number(reimbursement) + Number(bonus),
                          )
                        : '–'}
                    </Text>
                  ),
                },
              ]}
              itemMenu={({ contractorUuid, mayCancel, uuid }) => {
                const items = [
                  {
                    label: t('actions.view'),
                    onClick: () => {
                      onViewPayment(contractorUuid!)
                    },
                    icon: (
                      <span className={styles.icon}>
                        <EyeIcon aria-hidden />
                      </span>
                    ),
                  },
                ]
                if (mayCancel) {
                  items.push({
                    label: t('actions.cancel'),
                    onClick: () => {
                      onCancelPayment(uuid!)
                    },
                    icon: (
                      <span className={styles.icon}>
                        <CancelIcon aria-hidden />
                      </span>
                    ),
                  })
                }
                return (
                  <HamburgerMenu
                    items={items}
                    triggerLabel={t('tableHeaders.action')}
                    isLoading={isCancelling}
                  />
                )
              }}
              data={payments}
              label={t('title')}
            />
          </>
        )}
      </Flex>
    </Flex>
  )
}
