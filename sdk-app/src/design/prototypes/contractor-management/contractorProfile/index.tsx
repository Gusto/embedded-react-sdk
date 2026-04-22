import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createMachine } from 'robot3'
import type { EntityIds } from '../../../../useEntities'
import { contractorProfileStateMachine } from './contractorProfileStateMachine'
import type { ContractorProfileContextInterface } from './ContractorProfileComponents'
import { ProfileViewContextual } from './ContractorProfileComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, useBase } from '@/components/Base'

function ContractorProfileRoot() {
  const { onEvent } = useBase()
  const { entities } = useOutletContext<{ entities: EntityIds }>()

  const machine = useMemo(
    () =>
      createMachine(
        'profile',
        contractorProfileStateMachine,
        (initialContext: ContractorProfileContextInterface) => ({
          ...initialContext,
          component: ProfileViewContextual,
          contractorId: entities.contractorId,
          selectedTab: 'basic-details',
        }),
      ),
    [entities.contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function ContractorProfile() {
  return (
    <BaseComponent onEvent={() => {}}>
      <ContractorProfileRoot />
    </BaseComponent>
  )
}
