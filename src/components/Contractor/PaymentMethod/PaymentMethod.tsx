import { createMachine } from 'robot3'
import { paymentMethodStateMachine } from './stateMachine'
import type { PaymentMethodContextInterface } from './types'
import { PaymentMethodSelectionContextual } from './MachineComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface LocationsProps extends BaseComponentInterface<'Company.Locations'> {
  companyId: string
  contractorId: string
}

export function PaymentMethod({ companyId, contractorId, onEvent, dictionary }: LocationsProps) {
  useComponentDictionary('Company.Locations', dictionary)

  const manageLocations = createMachine(
    'index',
    paymentMethodStateMachine,
    (initialContext: PaymentMethodContextInterface) => ({
      ...initialContext,
      component: PaymentMethodSelectionContextual,
      companyId,
      contractorId,
    }),
  )
  return <Flow machine={manageLocations} onEvent={onEvent} />
}

/**
 * States:
 * - index: initial state, payment method is not direct deposit and there's no bank account.
 *    - Display the payment method selection form.
 *    - Upon selecting direct deposit, show bank account form.
 * - directDeposit.withBank: direct deposit is selected and bank account exists
 *    - Display the payment method selection form
 *    - Show bank account list
 * - split: show split account state
 * - check: show payment method form
 */
