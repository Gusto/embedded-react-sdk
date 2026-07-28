import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type CompensationContextInterface } from './CompensationComponents'
import { compensationStateMachine } from './compensationStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Compensation}.
 *
 * @public
 */
export interface CompensationProps extends BaseComponentInterface<'Contractor.Management.Compensation'> {
  /** The associated contractor identifier. */
  contractorId: string
}

function CompensationFlow({ contractorId, onEvent }: CompensationProps) {
  useI18n('Contractor.Management.Compensation')

  const machine = useMemo(
    () =>
      createMachine('card', compensationStateMachine, (ctx: CompensationContextInterface) => ({
        ...ctx,
        component: CardContextual,
        contractorId,
        successAlert: null,
      })),
    [contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Management surface for viewing and editing a contractor's compensation after onboarding.
 *
 * @remarks
 * Drives the read-view card and edit form via an internal state machine.
 * Emits events on the supplied `onEvent` handler when the user requests an
 * edit, saves changes, or cancels.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/compensation/editRequested` | Fired when the user clicks Edit on the read-view card | `{ contractorId: string }` |
 * | `contractor/management/compensation/updated` | Fired after compensation is successfully saved | {@link APIModels.Contractor} |
 * | `contractor/management/compensation/editCancelled` | Fired when the user cancels editing | — |
 *
 * @param props - See {@link CompensationProps}.
 * @returns The contractor compensation management surface.
 * @public
 */
export function Compensation({ dictionary, FallbackComponent, ...props }: CompensationProps) {
  useComponentDictionary('Contractor.Management.Compensation', dictionary)
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Compensation"
      FallbackComponent={FallbackComponent}
    >
      <CompensationFlow {...props} />
    </BaseBoundaries>
  )
}
