import { useMemo } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { createMachine } from 'robot3'
import type { EntityIds } from '../../../../../useEntities'
import { contractorProfileStateMachine } from './contractorProfileStateMachine'
import type { ContractorProfileContextInterface } from './ContractorProfileComponents'
import { ProfileViewContextual } from './ContractorProfileComponents'
import { EmptyData } from '@/components/Common'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, useBase } from '@/components/Base'

function ContractorProfileRoot() {
  const { onEvent } = useBase()
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const { contractorId: routeContractorId } = useParams<{ contractorId: string }>()

  const resolvedContractorId = routeContractorId || entities.contractorId

  const machine = useMemo(
    () =>
      createMachine(
        'profile',
        contractorProfileStateMachine,
        (initialContext: ContractorProfileContextInterface) => ({
          ...initialContext,
          component: ProfileViewContextual,
          contractorId: resolvedContractorId,
          selectedTab: 'basic-details',
        }),
      ),
    [resolvedContractorId],
  )

  if (!resolvedContractorId) {
    return <EmptyData title="No contractor selected. Set a Contractor ID in the settings panel." />
  }

  return <Flow machine={machine} onEvent={onEvent} />
}

export function ContractorProfile() {
  return (
    <BaseComponent onEvent={() => {}}>
      <ContractorProfileRoot />
    </BaseComponent>
  )
}
