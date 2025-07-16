import { componentEvents } from '@/shared/constants'

export type StateTaxesState = 'viewStateTaxes' | 'editStateTaxes' | 'done'

export interface StateTaxesStateData {
  state: StateTaxesState
  selectedState?: string
}

export type StateTaxesAction =
  | { type: typeof componentEvents.COMPANY_STATE_TAX_EDIT; payload: { state: string } }
  | { type: typeof componentEvents.COMPANY_STATE_TAX_UPDATED }
  | { type: typeof componentEvents.COMPANY_STATE_TAX_DONE }
  | { type: typeof componentEvents.CANCEL }

export const initialState: StateTaxesStateData = {
  state: 'viewStateTaxes',
  selectedState: undefined,
}

export function stateTaxesReducer(
  state: StateTaxesStateData,
  action: StateTaxesAction,
): StateTaxesStateData {
  switch (action.type) {
    case componentEvents.COMPANY_STATE_TAX_EDIT:
      return {
        ...state,
        state: 'editStateTaxes',
        selectedState: action.payload.state,
      }

    case componentEvents.COMPANY_STATE_TAX_UPDATED:
      return {
        ...state,
        state: 'viewStateTaxes',
        selectedState: undefined,
      }

    case componentEvents.CANCEL:
      return {
        ...state,
        state: 'viewStateTaxes',
        selectedState: undefined,
      }

    case componentEvents.COMPANY_STATE_TAX_DONE:
      return {
        ...state,
        state: 'done',
        selectedState: undefined,
      }

    default:
      return state
  }
}
