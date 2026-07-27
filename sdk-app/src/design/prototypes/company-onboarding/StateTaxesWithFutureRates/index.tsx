import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ComponentStatesPage } from '../../ComponentStatesPage'
import { StateTaxesWithFutureRates } from './StateTaxesWithFutureRates'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/state-taxes-with-future-rates'

export function StateTaxesWithFutureRatesPrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">State taxes with future rates</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to load real data.
        </Components.Alert>
      </Flex>
    )
  }

  return <StateTaxesWithFutureRates companyId={entities.companyId} />
}

export function StateTaxesWithFutureRatesStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
