import { Suspense } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../useEntities'
import { AgentPaymentsFlow } from './AgentPaymentsFlow'
import { Flex } from '@/components/Common'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function AgentPaymentsContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const { onEvent } = useBase()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <div>
        <Components.Heading as="h2">Agent Payments</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to preview this flow.
        </Components.Alert>
      </div>
    )
  }

  return <AgentPaymentsFlow companyId={entities.companyId} onEvent={onEvent} />
}

export function AgentPayments() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <AgentPaymentsContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
