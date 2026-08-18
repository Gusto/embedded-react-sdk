import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type AddressContextInterface } from './AddressComponents'
import { addressStateMachine } from './addressStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Address}.
 *
 * @public
 */
export interface AddressProps extends BaseComponentInterface<'Contractor.Management.Address'> {
  /** The associated contractor identifier. */
  contractorId: string
}

function AddressFlow({ contractorId, onEvent, LoaderComponent }: AddressProps) {
  useI18n('Contractor.Management.Address')

  const machine = useMemo(
    () =>
      createMachine('card', addressStateMachine, (ctx: AddressContextInterface) => ({
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
 * Management surface for viewing and editing a contractor's mailing address after onboarding.
 *
 * @remarks
 * Drives the read-view card and edit form via an internal state machine.
 * Emits events on the supplied `onEvent` handler when the user requests an
 * edit, saves changes, or cancels.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/address/editRequested` | Fired when the user clicks Edit on the read-view card | `{ contractorId: string }` |
 * | `contractor/management/address/updated` | Fired after the address is successfully saved | {@link APIModels.ContractorAddress} |
 * | `contractor/management/address/editCancelled` | Fired when the user cancels editing | — |
 *
 * @param props - See {@link AddressProps}.
 * @returns The contractor address management surface.
 * @public
 */
export function Address({
  dictionary,
  FallbackComponent,
  LoaderComponent,
  ...props
}: AddressProps) {
  useComponentDictionary('Contractor.Management.Address', dictionary)
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Address"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <AddressFlow LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
