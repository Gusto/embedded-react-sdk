import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../useEntities'
import { RropApiVerification } from './RropApiVerification'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function RropApiVerificationPrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">Regular Rate of Pay — API verification</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to run the RRoP verification hooks against live
          data.
        </Components.Alert>
      </Flex>
    )
  }

  return (
    <RropApiVerification
      companyId={entities.companyId}
      payrollId={entities.payrollId || undefined}
    />
  )
}
