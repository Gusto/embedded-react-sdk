import { useReducer } from 'react'
import { stateTaxesReducer, initialState } from './stateTaxesReducer'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual, StateTaxesFormContextual } from './StateTaxesComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)

  const [stateData, dispatch] = useReducer(stateTaxesReducer, initialState)

  const handleEvent: OnEventType<EventType, unknown> = (eventType, data) => {
    // Handle the event and dispatch to reducer
    switch (eventType) {
      case componentEvents.COMPANY_STATE_TAX_EDIT:
        dispatch({ type: eventType, payload: data as { state: string } })
        break
      case componentEvents.COMPANY_STATE_TAX_UPDATED:
        dispatch({ type: eventType })
        break
      case componentEvents.COMPANY_STATE_TAX_DONE:
        dispatch({ type: eventType })
        break
      case componentEvents.CANCEL:
        dispatch({ type: eventType })
        break
      default:
        // Pass through other events to parent
        onEvent(eventType, data)
        break
    }

    onEvent(eventType, data)
  }

  const contextProps: StateTaxesContextInterface = {
    companyId,
    stateData,
    onEvent: handleEvent,
  }

  // Render the appropriate component based on state
  switch (stateData.state) {
    case 'editStateTaxes':
      return <StateTaxesFormContextual {...contextProps} />
    case 'viewStateTaxes':
    default:
      return <StateTaxesListContextual {...contextProps} />
  }
}
