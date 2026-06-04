import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  FederalTaxesCardContextual,
  type FederalTaxesContextInterface,
} from './FederalTaxesComponents'
import { federalTaxesStateMachine } from './federalTaxesStateMachine'
import { Flow } from '@/components/Flow/Flow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'

export interface FederalTaxesProps extends CommonComponentInterface<'Employee.Management.FederalTaxes'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function FederalTaxesFlow({ employeeId, onEvent }: FederalTaxesProps) {
  useI18n('Employee.Management.FederalTaxes')

  const machine = useMemo(
    () =>
      createMachine('card', federalTaxesStateMachine, (ctx: FederalTaxesContextInterface) => ({
        ...ctx,
        component: FederalTaxesCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function FederalTaxes({
  dictionary,
  FallbackComponent,
  ...props
}: FederalTaxesProps & BaseComponentInterface<'Employee.Management.FederalTaxes'>) {
  useComponentDictionary('Employee.Management.FederalTaxes', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.FederalTaxes"
      FallbackComponent={FallbackComponent}
    >
      <FederalTaxesFlow {...props} />
    </BaseBoundaries>
  )
}
