import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ComponentStatesPage } from '../../ComponentStatesPage'
import { ManagePaySchedules } from './ManagePaySchedules'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/manage-pay-schedules'

export function ManagePaySchedulesPrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">Manage pay schedules</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to load real data.
        </Components.Alert>
      </Flex>
    )
  }

  return <ManagePaySchedules companyId={entities.companyId} />
}

export function ManagePaySchedulesStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
