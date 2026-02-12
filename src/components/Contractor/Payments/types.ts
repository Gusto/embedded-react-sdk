import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { ContractorPaymentGroupTotals } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { ReactNode } from 'react'

export type { ContractorPaymentGroup, ContractorPaymentForGroup, ContractorPaymentGroupTotals }

export type ContractorPaymentGroupMinimal = Omit<ContractorPaymentGroup, 'contractorPayments'>

export type InternalAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
  onDismiss?: () => void
  translationParams?: Record<string, unknown>
  onAction?: () => void
  actionLabel?: string
}
