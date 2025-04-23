import { reduce, state, state as final, transition } from 'robot3'
import type { ComponentType } from 'react'
import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'
import type { UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { useFlowParams } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/Flow'

type EventPayloads = {
  [componentEvents.COMPANY_STATE_TAX_UPDATED]: undefined
  [componentEvents.COMPANY_STATE_TAX_EDIT]: undefined
}

export interface StateTaxesContextInterface extends FlowContextInterface {
  companyId: string
  state: string
}

function useStateTaxesFlowParams(props: UseFlowParamsProps<StateTaxesContextInterface>) {
  return useFlowParams(props)
}

export function StateTaxesListContextual() {
  const { companyId, onEvent } = useStateTaxesFlowParams({
    component: 'StateTaxesList',
    requiredParams: ['companyId'],
  })
  return <StateTaxesList onEvent={onEvent} companyId={companyId} />
}

export function StateTaxesFormContextual() {
  const { companyId, state, onEvent } = useStateTaxesFlowParams({
    component: 'StateTaxesForm',
    requiredParams: ['companyId', 'state'],
  })
  return <StateTaxesForm companyId={companyId} state={state} onEvent={onEvent} />
}

export const stateTaxesStateMachine = {
  viewStateTaxes: state(
    transition(
      componentEvents.COMPANY_STATE_TAX_EDIT,
      'editStateTaxes',
      reduce((ctx: StateTaxesContextInterface) => ({
        ...ctx,
        component: StateTaxesFormContextual as ComponentType,
        showVerifiedMessage: false,
      })),
    ),
    transition(componentEvents.COMPANY_STATE_TAX_DONE, 'done'),
  ),
  editStateTaxes: state(
    transition(
      componentEvents.COMPANY_STATE_TAX_UPDATED,
      'viewStateTaxes',
      reduce(
        (
          ctx: StateTaxesContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_STATE_TAX_UPDATED>,
        ) => ({
          ...ctx,
          component: StateTaxesListContextual as ComponentType,
          stateTax: ev.payload,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewStateTaxes',
      reduce((ctx: StateTaxesContextInterface) => ({
        ...ctx,
        component: StateTaxesListContextual as ComponentType,
      })),
    ),
  ),
  done: final(),
}
