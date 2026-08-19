import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { getContractorDisplayName } from '../../../shared/helpers'
import {
  getContractorPaymentWageAmount,
  getContractorPaymentTotalAmount,
  type ContractorPaymentAmountFields,
} from '../paymentAmounts'
import { DataView, Flex } from '@/components/Common'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'

const ZERO_HOURS_DISPLAY = '0.000'

/**
 * The subset of a contractor payment record `PaymentSummaryBlock` renders. Both
 * `ContractorPaymentForGroup` (post-creation) and `ContractorPaymentForGroupPreview` (pre-creation)
 * satisfy this structurally, so the block works for a not-yet-submitted preview and an
 * already-created group alike.
 *
 * @internal
 */
export interface PaymentSummaryBlockContractorPayment extends ContractorPaymentAmountFields {
  contractorUuid?: string
  paymentMethod?: string
}

/**
 * The subset of a contractor payment group `PaymentSummaryBlock` renders. Both
 * `ContractorPaymentGroup` and `ContractorPaymentGroupPreview` satisfy this structurally.
 *
 * @internal
 */
export interface PaymentSummaryBlockGroup {
  checkDate?: string
  debitDate?: string
  totals?: {
    amount?: string
    debitAmount?: string
  }
  contractorPayments?: PaymentSummaryBlockContractorPayment[]
}

/**
 * Every string `PaymentSummaryBlock` renders. There is no default copy or namespace of its own —
 * `PaymentSummaryBlock` is `@internal`, so each caller (`PaymentSummary`, `HistoricalPaymentSummary`)
 * must fully resolve this from its own public namespace and pass it down, rather than this
 * component owning a namespace that would show up in the SDK's public translation types without
 * ever being a real partner override surface.
 *
 * @internal
 */
export interface PaymentSummaryBlockDictionary {
  paymentSummaryTitle: string
  totalAmount: string
  /** Required when `showDebitColumns` is `true`. */
  debitAmount?: string
  /** Required when `showDebitColumns` is `true`. */
  debitAccount?: string
  /** Required when `showDebitColumns` is `true`. */
  debitDate?: string
  contractorPayDate: string
  contractorPaymentsTitle: string
  contractor: string
  wageType: string
  paymentMethod: string
  paymentMethods: {
    directDeposit: string
    check: string
    historicalPayment: string
  }
  hours: string
  wage: string
  bonus: string
  reimbursement: string
  total: string
  totalsLabel: string
  notAvailable: string
}

/** @internal */
export interface PaymentSummaryBlockProps {
  contractorPaymentGroup: PaymentSummaryBlockGroup
  contractors: Contractor[]
  bankAccount?: CompanyBankAccount
  /** Whether to show the debit amount, debit account, and debit date columns. Defaults to `true`. */
  showDebitColumns?: boolean
  dictionary: PaymentSummaryBlockDictionary
}

/** @internal */
export const PaymentSummaryBlock = ({
  contractorPaymentGroup,
  contractors,
  bankAccount,
  showDebitColumns = true,
  dictionary,
}: PaymentSummaryBlockProps) => {
  const currencyFormatter = useNumberFormatter()

  const formatWageType = (contractor: PaymentSummaryBlockContractorPayment) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `Hourly ${currencyFormatter(Number(contractor.hourlyRate))}/hr`
    }
    return contractor.wageType
  }

  const formatPaymentMethod = (paymentMethod?: string) => {
    switch (paymentMethod) {
      case 'Direct Deposit':
        return dictionary.paymentMethods.directDeposit
      case 'Check':
        return dictionary.paymentMethods.check
      case 'Historical Payment':
        return dictionary.paymentMethods.historicalPayment
      default:
        return paymentMethod || dictionary.notAvailable
    }
  }

  const contractorPayments = contractorPaymentGroup.contractorPayments || []

  const totals = useMemo(() => {
    return contractorPayments.reduce(
      (acc, contractorPayment) => {
        acc.wageAmount += getContractorPaymentWageAmount(contractorPayment)
        acc.bonusAmount += Number(contractorPayment.bonus || '0')
        acc.reimbursementAmount += Number(contractorPayment.reimbursement || '0')
        acc.totalAmount += getContractorPaymentTotalAmount(contractorPayment)
        return acc
      },
      { wageAmount: 0, bonusAmount: 0, reimbursementAmount: 0, totalAmount: 0 },
    )
  }, [contractorPayments])

  return (
    <Flex flexDirection="column" gap={32}>
      <DataView
        columns={[
          {
            title: dictionary.totalAmount,
            render: () => currencyFormatter(Number(contractorPaymentGroup.totals?.amount || '0')),
          },
          ...(showDebitColumns
            ? [
                {
                  title: dictionary.debitAmount ?? '',
                  render: () =>
                    currencyFormatter(Number(contractorPaymentGroup.totals?.debitAmount || '0')),
                },
                {
                  title: dictionary.debitAccount ?? '',
                  render: () => bankAccount?.hiddenAccountNumber ?? dictionary.notAvailable,
                },
                {
                  title: dictionary.debitDate ?? '',
                  render: () => contractorPaymentGroup.debitDate || dictionary.notAvailable,
                },
              ]
            : []),
          {
            title: dictionary.contractorPayDate,
            render: () => contractorPaymentGroup.checkDate || dictionary.notAvailable,
          },
        ]}
        data={[contractorPaymentGroup]}
        label={dictionary.paymentSummaryTitle}
      />

      {contractorPayments.length > 0 && (
        <DataView
          columns={[
            {
              title: dictionary.contractor,
              render: contractorPayment =>
                getContractorDisplayName(
                  contractors.find(
                    contractor => contractor.uuid === contractorPayment.contractorUuid,
                  ),
                ) || dictionary.notAvailable,
            },
            {
              title: dictionary.wageType,
              render: contractorPayment => formatWageType(contractorPayment),
            },
            {
              title: dictionary.paymentMethod,
              render: contractorPayment => formatPaymentMethod(contractorPayment.paymentMethod),
            },
            {
              title: dictionary.hours,
              justify: 'end',
              render: contractorPayment =>
                contractorPayment.wageType === 'Hourly' && contractorPayment.hours
                  ? formatHoursDisplay(parseFloat(contractorPayment.hours))
                  : ZERO_HOURS_DISPLAY,
            },
            {
              title: dictionary.wage,
              justify: 'end',
              render: contractorPayment =>
                currencyFormatter(getContractorPaymentWageAmount(contractorPayment)),
            },
            {
              title: dictionary.bonus,
              justify: 'end',
              render: contractorPayment =>
                currencyFormatter(Number(contractorPayment.bonus || '0')),
            },
            {
              title: dictionary.reimbursement,
              justify: 'end',
              render: contractorPayment =>
                currencyFormatter(Number(contractorPayment.reimbursement || '0')),
            },
            {
              title: dictionary.total,
              justify: 'end',
              render: contractorPayment =>
                currencyFormatter(getContractorPaymentTotalAmount(contractorPayment)),
            },
          ]}
          data={contractorPayments}
          footer={() => ({
            'column-0': dictionary.totalsLabel,
            'column-4': currencyFormatter(totals.wageAmount || 0),
            'column-5': currencyFormatter(totals.bonusAmount || 0),
            'column-6': currencyFormatter(totals.reimbursementAmount || 0),
            'column-7': currencyFormatter(totals.totalAmount || 0),
          })}
          label={dictionary.contractorPaymentsTitle}
        />
      )}
    </Flex>
  )
}
