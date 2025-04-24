import { createMachine } from 'robot3'
import { type LocationsContextInterface } from './locationsStateMachine'
import { locationsStateMachine } from './stateMachine'
import { LocationsListContextual } from './locationsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface LocationsProps extends BaseComponentInterface {
  companyId: string
}

export function LocationsFlow({ companyId, onEvent }: LocationsProps) {
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
