import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual } from './StateTaxesComponents'

interface UseCompanyStateTaxesProps {
  companyId: string
}

export function useCompanyStateTaxes({ companyId }: UseCompanyStateTaxesProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'viewStateTaxes',
        stateTaxesStateMachine,
        (initialContext: StateTaxesContextInterface) => ({
          ...initialContext,
          component: StateTaxesListContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
