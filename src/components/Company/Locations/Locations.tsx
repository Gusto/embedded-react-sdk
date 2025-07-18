import { createMachine } from 'robot3'
import { type LocationsContextInterface } from './locationsStateMachine'
import { locationsStateMachine } from './stateMachine'
import { LocationsListContextual } from './locationsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface LocationsProps extends BaseComponentInterface<'Company.Locations'> {
  companyId: string
}

export function Locations({ companyId, onEvent, dictionary }: LocationsProps) {
  useComponentDictionary('Company.Locations', dictionary)

  const manageLocations = createMachine(
    'index',
    locationsStateMachine,
    (initialContext: LocationsContextInterface) => ({
      ...initialContext,
      component: LocationsListContextual,
      companyId,
    }),
  )
  return <Flow machine={manageLocations} onEvent={onEvent} />
}
