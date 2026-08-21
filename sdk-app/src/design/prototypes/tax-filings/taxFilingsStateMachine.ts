import { transition, reduce, state } from 'robot3'
import { taxFilingsEvents } from './events'
import {
  TaxFilingsListContextual,
  TaxFilingDetailContextual,
  type TaxFilingsFlowContextInterface,
} from './TaxFilingsFlowComponents'
import type { MachineTransition } from '@/types/Helpers'

const createReducer = (props: Partial<TaxFilingsFlowContextInterface>) => {
  return (ctx: TaxFilingsFlowContextInterface): TaxFilingsFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const taxFilingsMachine = {
  list: state<MachineTransition>(
    transition(
      taxFilingsEvents.TAX_FILING_SELECTED,
      'detail',
      reduce((ctx: TaxFilingsFlowContextInterface, event: { payload: string }) =>
        createReducer({
          component: TaxFilingDetailContextual,
          selectedFilingUuid: event.payload,
          header: null,
        })(ctx),
      ),
    ),
  ),
  detail: state<MachineTransition>(
    transition(
      taxFilingsEvents.TAX_FILING_BACK,
      'list',
      reduce(
        createReducer({
          component: TaxFilingsListContextual,
          selectedFilingUuid: null,
          header: null,
        }),
      ),
    ),
  ),
}
