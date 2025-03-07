import { createMachine } from 'robot3'
import {
  locationsStateMachine,
  type LocationsContextInterface,
} from './locationsStateMachine'
import { LocationsListContextual } from './locationsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface LocationsProps extends BaseComponentInterface {
  companyId: string
}

export function Locations({ companyId, onEvent }: LocationsProps)  {
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
