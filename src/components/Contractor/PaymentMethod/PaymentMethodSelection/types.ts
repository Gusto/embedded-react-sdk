import type { BaseComponentInterface } from '@/components/Base'

export interface PaymentMethodSelectionProps
  extends BaseComponentInterface<'Contractor.PaymentMethod'> {
  contractorId: string
}
