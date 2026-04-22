import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { contractorProfileStateMachine } from './contractorProfileStateMachine'
import type { ContractorProfileContextInterface } from './ContractorProfileComponents'
import { ProfileViewContextual } from './ContractorProfileComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, useBase } from '@/components/Base'

function ContractorProfileRoot() {
  const { onEvent } = useBase()
  const companyId = String(import.meta.env.VITE_COMPANY_ID || '')

  const machine = useMemo(
    () =>
      createMachine(
        'profile',
        contractorProfileStateMachine,
        (initialContext: ContractorProfileContextInterface) => ({
          ...initialContext,
          component: ProfileViewContextual,
          companyId,
        }),
      ),
    [companyId],
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
