import type { ContractorBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorbankaccount'
import type { BaseComponentInterface } from '@/components/Base'

export interface PaymentMethodProps extends BaseComponentInterface<'Contractor.PaymentMethod'> {
  contractorId: string
}

export interface BankAccountFormProps {
  bankAccount?: ContractorBankAccount
}
