import { transition, reduce, state } from 'robot3'
import {
  TaxFilingsListContextual,
  TaxFilingDetailContextual,
  type TaxFilingsFlowContextInterface,
} from './TaxFilingsFlowComponents'
import { taxFilingsEvents } from '@/shared/constants'
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
          header: { type: 'minimal' },
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
