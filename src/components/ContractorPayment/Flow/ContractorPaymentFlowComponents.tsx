import { useState } from 'react'
import { CreatePaymentPresentation } from '../CreatePayment/CreatePaymentPresentation'
import { PaymentHistoryPresentation } from '../PaymentHistory/PaymentHistoryPresentation'
import { OverviewPresentation } from '../Overview/OverviewPresentation'
import { DetailPresentation } from '../Detail/DetailPresentation'
import type { ContractorDataStrict } from '../types'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

export type ContractorPaymentFlowDefaultValues = Record<string, unknown>

export interface ContractorPaymentFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: ContractorPaymentFlowDefaultValues
}

export interface ContractorPaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
  defaultValues?: ContractorPaymentFlowDefaultValues
}

export function ContractorPaymentPaymentHistoryContextual() {
  const { onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
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

export function ContractorPaymentCreatePaymentContextual() {
  const { onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
  const [contractors, setContractors] = useState<ContractorDataStrict[]>([
    {
      id: '1',
      name: 'Armstrong, Louis',
      wageType: 'Fixed' as const,
      paymentMethod: 'Direct Deposit' as const,
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      total: 1000,
    },
    {
      id: '2',
      name: 'Fitzgerald, Ella',
      wageType: 'Hourly' as const,
      hourlyRate: 18,
      paymentMethod: 'Direct Deposit' as const,
      hours: 10,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      total: 180,
    },
  ])
  const [paymentDate, setPaymentDate] = useState('2025-09-17')
  const [editingContractor, setEditingContractor] = useState<ContractorDataStrict | null>(null)

  const totalWages = contractors.reduce((sum, c) => sum + c.wage + c.hours * (c.hourlyRate || 0), 0)
  const totalBonus = contractors.reduce((sum, c) => sum + c.bonus, 0)
  const totalReimbursement = contractors.reduce((sum, c) => sum + c.reimbursement, 0)
  const grandTotal = totalWages + totalBonus + totalReimbursement

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
      onEditContractor={setEditingContractor}
      editingContractor={editingContractor}
      onSaveContractor={updatedContractor => {
        setContractors(prev =>
          prev.map(c => (c.id === updatedContractor.id ? updatedContractor : c)),
        )
        setEditingContractor(null)
      }}
      onCancelEdit={() => {
        setEditingContractor(null)
      }}
      totals={{
        wages: totalWages,
        bonus: totalBonus,
        reimbursement: totalReimbursement,
        total: grandTotal,
      }}
    />
  )
}

export function ContractorPaymentOverviewContextual() {
  const { onEvent } = useFlow<ContractorPaymentFlowContextInterface>()

  const mockPaymentSummary = {
    totalAmount: 1180,
    debitAmount: 1180,
    debitAccount: 'Checking Account ending in 4567',
    debitDate: '2025-09-15',
    contractorPayDate: '2025-09-17',
    checkDate: '2025-09-17',
    submitByDate: '2025-09-14',
  }

  const mockContractors = [
    {
      id: '1',
      name: 'Armstrong, Louis',
      wageType: 'Fixed' as const,
      paymentMethod: 'Direct Deposit' as const,
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      total: 1000,
    },
    {
      id: '2',
      name: 'Fitzgerald, Ella',
      wageType: 'Hourly' as const,
      hourlyRate: 18,
      paymentMethod: 'Direct Deposit' as const,
      hours: 10,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      total: 180,
    },
  ]

  return (
    <OverviewPresentation
      paymentSummary={mockPaymentSummary}
      contractors={mockContractors}
      onEdit={() => {
        onEvent(componentEvents.PAYMENT_BACK)
      }}
      onSubmit={() => {
        onEvent(componentEvents.PAYMENT_SUBMITTED)
      }}
    />
  )
}

export function ContractorPaymentDetailContextual() {
  const { selectedDate, onEvent } = useFlow<ContractorPaymentFlowContextInterface>()

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
