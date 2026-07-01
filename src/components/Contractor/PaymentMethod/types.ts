import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for the {@link PaymentMethod} component.
 *
 * @public
 */
export interface PaymentMethodProps extends BaseComponentInterface<'Contractor.PaymentMethod'> {
  /** Identifier of the contractor whose payment method is being managed. */
  contractorId: string
}
