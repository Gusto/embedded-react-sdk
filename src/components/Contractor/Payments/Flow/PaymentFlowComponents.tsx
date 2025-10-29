import { useState } from 'react'
import { CreatePaymentPresentation } from '../CreatePayment/CreatePaymentPresentation'
import { PaymentHistoryPresentation } from '../PaymentHistory/PaymentHistoryPresentation'
import { OverviewPresentation } from '../Overview/OverviewPresentation'
import { DetailPresentation } from '../Detail/DetailPresentation'
import type { ContractorPaymentForGroup, ContractorPaymentGroup } from '../types'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

export type PaymentFlowDefaultValues = Record<string, unknown>

export interface PaymentFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: PaymentFlowDefaultValues
}

export interface PaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
  defaultValues?: PaymentFlowDefaultValues
}

export function PaymentHistoryContextual() {
  const { onEvent } = useFlow<PaymentFlowContextInterface>()
  const [showData, setShowData] = useState(false)

  const mockHistory = [
    {
      paymentDate: '2025-09-17',
      reimbursementTotal: 0,
      wageTotal: 1180,
      contractorsCount: 2,
    },
  ]

  return (
    <PaymentHistoryPresentation
      paymentHistory={showData ? mockHistory : []}
      selectedDateRange="Last 3 months"
      onCreatePayment={() => {
        setShowData(true)
        onEvent(componentEvents.CREATE_PAYMENT_SELECTED)
      }}
      onDateRangeChange={() => {}}
      onDateSelected={(date: string) => {
        onEvent(componentEvents.DATE_SELECTED, { date })
      }}
      showSuccessMessage={false}
    />
  )
}

export function CreatePaymentContextual() {
  const { onEvent } = useFlow<PaymentFlowContextInterface>()
  const [contractors] = useState<ContractorPaymentForGroup[]>([
    {
      uuid: '1',
      contractorUuid: 'armstrong-louis',
      wageType: 'Fixed',
      paymentMethod: 'Direct Deposit',
      hours: undefined,
      wage: '1000',
      bonus: '0',
      reimbursement: '0',
      wageTotal: '1000',
    },
    {
      uuid: '2',
      contractorUuid: 'fitzgerald-ella',
      wageType: 'Hourly',
      hourlyRate: '18',
      paymentMethod: 'Direct Deposit',
      hours: '10',
      wage: undefined,
      bonus: '0',
      reimbursement: '0',
      wageTotal: '180',
    },
  ])
  const [paymentDate, setPaymentDate] = useState('2025-09-17')

  // TODO: PLACEHOLDER - Replace with actual totals from contractor payment groups API
  const groupTotals = {
    amount: '1180',
    debitAmount: '1180',
    wageAmount: '1000',
    reimbursementAmount: '0',
  }

  return (
    <CreatePaymentPresentation
      contractors={contractors}
      paymentDate={paymentDate}
      onPaymentDateChange={setPaymentDate}
      onBack={() => {
        onEvent(componentEvents.PAYMENT_BACK)
      }}
      onSaveAndContinue={() => {
        onEvent(componentEvents.PAYMENT_CONFIGURED, { paymentGroupId: 'payment-group-1' })
      }}
      onEditContractor={(contractor: ContractorPaymentForGroup) => {
        // TODO: PLACEHOLDER - Wire up to pass contractor through flow state machine
      }}
      totals={groupTotals}
    />
  )
}

export function PaymentEditContextual() {
  // TODO: PLACEHOLDER - Implement flow state machine to pass contractor data
  return null
}

export function OverviewContextual() {
  const { onEvent } = useFlow<PaymentFlowContextInterface>()

  // TODO: PLACEHOLDER - Replace with actual contractor payment group from API
  const mockContractorPaymentGroup: ContractorPaymentGroup = {
    uuid: 'group-1',
    companyUuid: 'company-1',
    checkDate: '2025-09-17',
    debitDate: '2025-09-15',
    status: 'Unfunded',
    totals: {
      amount: '1180',
      debitAmount: '1180',
      wageAmount: '1000',
      reimbursementAmount: '0',
    },
    contractorPayments: [
      {
        uuid: '1',
        contractorUuid: 'armstrong-louis',
        wageType: 'Fixed',
        paymentMethod: 'Direct Deposit',
        hours: undefined,
        wage: '1000',
        bonus: '0',
        reimbursement: '0',
        wageTotal: '1000',
      },
      {
        uuid: '2',
        contractorUuid: 'fitzgerald-ella',
        wageType: 'Hourly',
        hourlyRate: '18',
        paymentMethod: 'Direct Deposit',
        hours: '10',
        wage: undefined,
        bonus: '0',
        reimbursement: '0',
        wageTotal: '180',
      },
    ],
  }

  const mockPaymentSummary = {
    totalAmount: '1180',
    debitAmount: '1180',
    debitAccount: 'Checking Account ending in 4567',
    debitDate: '2025-09-15',
    contractorPayDate: '2025-09-17',
    checkDate: '2025-09-17',
    submitByDate: '2025-09-14',
  }

  return (
    <OverviewPresentation
      paymentSummary={mockPaymentSummary}
      contractorPaymentGroup={mockContractorPaymentGroup}
      onEdit={() => {
        onEvent(componentEvents.PAYMENT_BACK)
      }}
      onSubmit={() => {
        onEvent(componentEvents.PAYMENT_SUBMITTED)
      }}
    />
  )
}

export function DetailContextual() {
  const { selectedDate, onEvent } = useFlow<PaymentFlowContextInterface>()

  const mockPayments = [
    {
      id: '1',
      contractorName: 'Fitzgerald, Ella',
      hours: 10.0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 180,
    },
    {
      id: '2',
      contractorName: 'Armstrong, Louis',
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 1000,
    },
  ]

  const formattedDate = formatDateNamedWeekdayShortPlusDate(ensureRequired(selectedDate))

  return (
    <DetailPresentation
      date={formattedDate}
      payments={mockPayments}
      onBack={() => {
        onEvent(componentEvents.BACK_TO_LIST)
      }}
      onViewPayment={() => {}}
      onCancelPayment={() => {}}
    />
  )
}
