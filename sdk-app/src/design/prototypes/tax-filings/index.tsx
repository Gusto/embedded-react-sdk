import { Suspense } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../useEntities'
import { TaxFilingsFlow } from './TaxFilingsFlow'
import { Flex } from '@/components/Common'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function TaxFilingsContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const { onEvent } = useBase()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <div>
        <Components.Heading as="h2">Tax Filings</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set a company ID in Settings (top right) to preview this flow.
        </Components.Alert>
      </div>
    )
  }

  return <TaxFilingsFlow companyId={entities.companyId} onEvent={onEvent} />
}

export function TaxFilings() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <TaxFilingsContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
