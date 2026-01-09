import { useTranslation } from 'react-i18next'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useMemo } from 'react'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface PaymentStatementPresentationProps {
  payment: ContractorPaymentForGroup
  contractor: Contractor
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
}: PaymentStatementPresentationProps) => {
  const { Text, Heading } = useComponentContext()
  useI18n('Contractor.Payments.PaymentStatement')
  const { t } = useTranslation('Contractor.Payments.PaymentStatement')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatLongWithYear } = useDateFormatter()

  const contractorName = getContractorDisplayName(contractor)
  const isHourly = payment.wageType === 'Hourly'
  const hours = Number(payment.hours || 0)
  const hourlyRate = Number(payment.hourlyRate || 0)
  const bonus = Number(payment.bonus || 0)
  const reimbursement = Number(payment.reimbursement || 0)
  const wageTotal = Number(payment.wageTotal || 0)

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
  ])

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('title', { contractorName })}</Heading>
          <Text>{formatLongWithYear(checkDate)}</Text>
        </Flex>
      </Flex>

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
