import { Trans, useTranslation } from 'react-i18next'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useMemo } from 'react'
import type { ContractorPaymentReceipt } from '@gusto/embedded-api/models/components/contractorpaymentreceipt'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import styles from './PaymentStatementPresentation.module.scss'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { addressInline, formatPhoneNumber } from '@/helpers/formattedStrings'
import ReceiptCheck from '@/assets/icons/receipt-check.svg?react'

interface PaymentStatementPresentationProps {
  payment: ContractorPaymentForGroup
  contractor: Contractor
  paymentReceipt?: ContractorPaymentReceipt
  checkDate: string
}

type PaymentStatementRow = {
  label: string
  amount: string | null
}

export const PaymentStatementPresentation = ({
  payment,
  contractor,
  checkDate,
  paymentReceipt,
}: PaymentStatementPresentationProps) => {
  const { Text, Heading } = useComponentContext()
  useI18n('Contractor.Payments.PaymentStatement')
  const { t } = useTranslation('Contractor.Payments.PaymentStatement')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatLongWithYear } = useDateFormatter()
  const { Link } = useComponentContext()

  const contractorName = getContractorDisplayName(contractor)
  const isHourly = payment.wageType === 'Hourly'
  const hours = Number(payment.hours || 0)
  const hourlyRate = Number(payment.hourlyRate || 0)
  const bonus = Number(payment.bonus || 0)
  const reimbursement = Number(payment.reimbursement || 0)
  const wageTotal = Number(payment.wageTotal || 0)

  const shouldShowReceipt = Boolean(
    paymentReceipt && payment.status === 'Funded' && payment.paymentMethod === 'Direct Deposit',
  )

  const receiptTotal = paymentReceipt?.totals?.companyDebit || '0'

  const receiptDetailsConfig = useMemo(() => {
    if (!paymentReceipt) return []

    return [
      {
        label: t('receipt.from'),
        value: paymentReceipt.nameOfSender || '',
      },
      {
        label: t('receipt.to'),
        value: getContractorDisplayName(contractor),
      },
      {
        label: t('receipt.debitDate'),
        value: paymentReceipt.debitDate ? formatLongWithYear(String(paymentReceipt.debitDate)) : '',
      },
    ]
  }, [paymentReceipt, contractor, t, formatLongWithYear])

  const statementRows = useMemo<PaymentStatementRow[]>(() => {
    const rows: PaymentStatementRow[] = [
      {
        label: payment.paymentMethod || '',
        amount: currencyFormatter(wageTotal),
      },
    ]

    if (isHourly && hours > 0) {
      rows.push({
        label: t('hoursLabel'),
        amount: t('hoursAmount', {
          hours: formatHoursDisplay(hours),
          rate: currencyFormatter(hourlyRate),
        }),
      })
    } else {
      rows.push({
        label: t('wageLabel'),
        amount: currencyFormatter(Number(payment.wage || 0)),
      })
    }

    rows.push({
      label: t('bonus'),
      amount: currencyFormatter(bonus),
    })

    rows.push({
      label: t('reimbursement'),
      amount: currencyFormatter(reimbursement),
    })

    return rows
  }, [
    payment.paymentMethod,
    wageTotal,
    isHourly,
    hours,
    hourlyRate,
    bonus,
    reimbursement,
    t,
    currencyFormatter,
    payment.wage,
  ])

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('title', { contractorName })}</Heading>
          <Text>{formatLongWithYear(checkDate)}</Text>
        </Flex>
      </Flex>

      {shouldShowReceipt && (
        <div className={styles.receiptCard}>
          <Flex flexDirection="column" gap={24}>
            <Flex flexDirection="column" alignItems="center" gap={16}>
              <div className={styles.receiptIcon} aria-hidden>
                <ReceiptCheck className={styles.checkmarkIcon} />
              </div>

              <Flex flexDirection="column" alignItems="center" gap={8}>
                <Text size="sm" variant="supporting">
                  {t('receipt.totalLabel')}
                </Text>
                <Heading as="h1" styledAs="h2" className={styles.totalAmount}>
                  {currencyFormatter(Number(receiptTotal))}
                </Heading>
              </Flex>
            </Flex>

            <div className={styles.receiptDetailsTable}>
              <DataView
                label={t('receipt.detailsLabel')}
                variant="minimal"
                breakAt="small"
                breakpoints={{
                  base: '0rem',
                  small: '22rem',
                }}
                columns={[
                  {
                    title: '',
                    render: (item: { label: string; value: string }) => (
                      <Text size="sm" variant="supporting">
                        {item.label}
                      </Text>
                    ),
                  },
                  {
                    title: '',
                    render: (item: { label: string; value: string }) => (
                      <Text size="sm">{item.value}</Text>
                    ),
                  },
                ]}
                data={receiptDetailsConfig}
              />
            </div>
            <hr />
            <Flex flexDirection="column" alignItems="center" gap={12}>
              <Text size="sm" variant="supporting" className={styles.disclaimer}>
                <Trans
                  i18nKey="receipt.disclaimer"
                  t={t}
                  components={{
                    licensesLink: <Link href={paymentReceipt?.licenseUri || ''} target="_blank" />,
                  }}
                />
              </Text>
              <hr />

              <Text size="sm" variant="supporting" className={styles.companyInfo}>
                {paymentReceipt?.licensee?.name || ''}
              </Text>
              <Text size="sm" variant="supporting" className={styles.address}>
                {addressInline({
                  street1: paymentReceipt?.licensee?.address || '',
                  city: paymentReceipt?.licensee?.city || '',
                  state: paymentReceipt?.licensee?.state || '',
                  zip: paymentReceipt?.licensee?.postalCode || '',
                  uuid: '',
                })}
                {' | '}
                {formatPhoneNumber(paymentReceipt?.licensee?.phoneNumber)}
              </Text>
            </Flex>
          </Flex>
        </div>
      )}

      <DataView
        columns={[
          {
            title: t('debitedColumn'),
            render: ({ label }) => <Text>{label}</Text>,
          },
          {
            title: t('amountColumn'),
            render: ({ amount }) => <Text>{amount || ''}</Text>,
          },
        ]}
        data={statementRows}
        label={t('title', { contractorName })}
      />
    </Flex>
  )
}
