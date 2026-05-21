import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { taxFilingsMachine } from './taxFilingsStateMachine'
import type {
  TaxFilingsFlowProps,
  TaxFilingsFlowContextInterface,
} from './TaxFilingsFlowComponents'
import { TaxFilingsListContextual } from './TaxFilingsFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const TaxFilingsFlow = ({ companyId, onEvent }: TaxFilingsFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        taxFilingsMachine,
        (initialContext: TaxFilingsFlowContextInterface) => ({
          ...initialContext,
          component: TaxFilingsListContextual,
          companyId,
          selectedFilingUuid: null,
          header: null,
        }),
      ),
    [companyId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
