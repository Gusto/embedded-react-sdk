import { Suspense } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../../useEntities'
import { ContractorSelfOnboardingWizard } from './ContractorSelfOnboardingWizard'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function ContractorSelfOnboardingContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.contractorId) {
    return (
      <div>
        <Components.Heading as="h2">Contractor Self-Onboarding</Components.Heading>
        <Components.Alert label="Missing contractor ID" status="warning">
          Set a contractor ID in Settings (top right) to preview this flow. The contractor should be
          in a self-onboarding status (created with the &quot;Invite contractor&quot; toggle
          enabled).
        </Components.Alert>
      </div>
    )
  }

  return (
    <ContractorSelfOnboardingWizard
      contractorId={entities.contractorId}
      companyId={entities.companyId}
    />
  )
}

export function ContractorSelfOnboarding() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <ContractorSelfOnboardingContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
