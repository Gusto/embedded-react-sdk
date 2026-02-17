import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { type LocationsContextInterface } from './locationsStateMachine'
import { locationsStateMachine } from './stateMachine'
import { LocationsListContextual } from './locationsStateMachine'

interface UseCompanyLocationsProps {
  companyId: string
}

export function useCompanyLocations({ companyId }: UseCompanyLocationsProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        locationsStateMachine,
        (initialContext: LocationsContextInterface) => ({
          ...initialContext,
          component: LocationsListContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
