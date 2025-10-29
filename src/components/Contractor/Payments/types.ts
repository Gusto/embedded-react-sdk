import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { ContractorPaymentGroupTotals } from '@gusto/embedded-api/models/components/contractorpaymentgroup'

export type { ContractorPaymentGroup, ContractorPaymentForGroup, ContractorPaymentGroupTotals }

export type ContractorPaymentGroupMinimal = Omit<ContractorPaymentGroup, 'contractorPayments'>
