import { useMemo } from 'react'
import { CardContextual, type PaymentMethodContextInterface } from './PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { createMachine } from '@/lib/state-machine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link PaymentMethod}.
 *
 * @public
 */
export interface PaymentMethodProps extends BaseComponentInterface<'Contractor.Management.PaymentMethod'> {
  /** The associated contractor identifier. */
  contractorId: string
}

function PaymentMethodFlow({ contractorId, onEvent, LoaderComponent }: PaymentMethodProps) {
  useI18n('Contractor.Management.PaymentMethod')

  const machine = useMemo(
    () =>
      createMachine('card', paymentMethodStateMachine, (ctx: PaymentMethodContextInterface) => ({
        ...ctx,
        component: CardContextual,
        contractorId,
        successAlert: null,
        LoaderComponent,
      })),
    [contractorId, LoaderComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Management surface for viewing and editing a contractor's payment method after onboarding.
 *
 * @remarks
 * Drives the read-view card and bank-account form via an internal state
 * machine. Emits events on the supplied `onEvent` handler when the user
 * requests to add or edit a bank account, saves changes, or cancels.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/paymentMethod/card/addRequested` | Fired when the user clicks "Add bank account" on the read-view card | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/editRequested` | Fired when the user chooses "Edit" from the bank account row menu | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/removed` | Fired after the bank account is removed and the payment method reverts to Check | {@link APIModels.ContractorPaymentMethod} |
 * | `contractor/management/paymentMethod/bankForm/submitted` | Fired after the bank-account form is successfully saved | {@link APIModels.ContractorBankAccount} |
 * | `contractor/management/paymentMethod/bankForm/cancelled` | Fired when the user cancels the bank-account form | — |
 *
 * @param props - See {@link PaymentMethodProps}.
 * @returns The contractor payment method management surface.
 * @public
 */
export function PaymentMethod({
  dictionary,
  FallbackComponent,
  LoaderComponent,
  ...props
}: PaymentMethodProps) {
  useComponentDictionary('Contractor.Management.PaymentMethod', dictionary)
  return (
    <BaseBoundaries
      componentName="Contractor.Management.PaymentMethod"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <PaymentMethodFlow LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
