import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ComponentStatesPage } from '../../ComponentStatesPage'
import { CreateHistoricalPayment } from './CreateHistoricalPayment'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/create-historical-payment'

export function CreateHistoricalPaymentPrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">Create Historical Payment</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to load real data.
        </Components.Alert>
      </Flex>
    )
  }

  return <CreateHistoricalPayment companyId={entities.companyId} />
}

export function CreateHistoricalPaymentStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
