import { Suspense, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '../../contractor-profile/components/Skeleton'
import type { EntityIds } from '../../../../../../useEntities'
import { AddContractorWizard } from './AddContractorWizard'
import type { WizardStep } from './AddContractorWizard'
import { ContractorOnboardingOverview } from './ContractorOnboardingOverview'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CaretLeftIcon from '@/assets/icons/caret-left.svg?react'

function WizardSkeleton() {
  return (
    <Flex flexDirection="column" gap={24}>
      <Skeleton width="100%" height={8} />
      <Skeleton width={300} height={28} />
      <Skeleton width="100%" height={60} />
      <Skeleton width="100%" height={60} />
      <Skeleton width={200} height={40} />
    </Flex>
  )
}

function AddContractorContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const { contractorId } = useParams<{ contractorId: string }>()
  const [showWizard, setShowWizard] = useState(!contractorId)
  const [startStep, setStartStep] = useState<WizardStep>('profile')

  const handleContinue = (step: WizardStep) => {
    setStartStep(step)
    setShowWizard(true)
  }

  if (!showWizard && contractorId) {
    return <ContractorOnboardingOverview contractorId={contractorId} onContinue={handleContinue} />
  }

  return (
    <AddContractorWizard
      companyId={entities.companyId}
      contractorId={contractorId}
      initialStep={startStep}
    />
  )
}

export function AddContractor() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const Components = useComponentContext()

  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32}>
        <div>
          <Components.Button
            variant="secondary"
            onClick={() => {
              queryClient.removeQueries({
                queryKey: ['@gusto/embedded-api', 'Contractors', 'list'],
              })
              void navigate('..')
            }}
          >
            <CaretLeftIcon /> Back to contractors
          </Components.Button>
        </div>
        <Suspense fallback={<WizardSkeleton />}>
          <AddContractorContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
