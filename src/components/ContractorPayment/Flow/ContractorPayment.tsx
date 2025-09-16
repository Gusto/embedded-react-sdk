import { useReducer } from 'react'
import { componentEvents } from '@/shared/constants'
import type { EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

type FlowState = 'paymentHistory' | 'createPayment' | 'overview' | 'detail'

interface FlowContext {
  currentScreen: FlowState
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
}

type FlowAction =
  | { type: typeof componentEvents.CREATE_PAYMENT_SELECTED; payload?: unknown }
  | { type: typeof componentEvents.PAYMENT_CONFIGURED; payload?: { paymentGroupId?: string } }
  | { type: typeof componentEvents.PAYMENT_BACK; payload?: unknown }
  | { type: typeof componentEvents.PAYMENT_SUBMITTED; payload?: unknown }
  | { type: typeof componentEvents.DATE_SELECTED; payload?: { date?: string } }
  | { type: typeof componentEvents.BACK_TO_LIST; payload?: unknown }

const contractorPaymentFlowReducer = (state: FlowContext, action: FlowAction): FlowContext => {
  switch (action.type) {
    case componentEvents.CREATE_PAYMENT_SELECTED:
      return { ...state, currentScreen: 'createPayment' }
    case componentEvents.PAYMENT_CONFIGURED:
      return {
        ...state,
        currentScreen: 'overview',
        paymentGroupId: action.payload?.paymentGroupId,
      }
    case componentEvents.PAYMENT_BACK:
      return { ...state, currentScreen: 'createPayment' }
    case componentEvents.PAYMENT_SUBMITTED:
      return { ...state, currentScreen: 'paymentHistory' }
    case componentEvents.DATE_SELECTED:
      return {
        ...state,
        currentScreen: 'detail',
        selectedDate: action.payload?.date,
      }
    case componentEvents.BACK_TO_LIST:
      return { ...state, currentScreen: 'paymentHistory' }
    default:
      return state
  }
}

interface ContractorPaymentProps {
  companyId: string
  CreatePayment: React.ComponentType<{
    companyId: string
    paymentGroupId?: string
    onEvent: OnEventType<EventType, unknown>
  }>
  PaymentHistory: React.ComponentType<{
    companyId: string
    onEvent: OnEventType<EventType, unknown>
  }>
  Overview: React.ComponentType<{
    companyId: string
    paymentGroupId: string
    onEvent: OnEventType<EventType, unknown>
  }>
  Detail: React.ComponentType<{
    companyId: string
    date: string
    onEvent: OnEventType<EventType, unknown>
  }>
  onEvent: OnEventType<EventType, unknown>
}

export const ContractorPayment = ({
  companyId,
  CreatePayment,
  PaymentHistory,
  Overview,
  Detail,
  onEvent,
}: ContractorPaymentProps) => {
  const [state, dispatch] = useReducer(contractorPaymentFlowReducer, {
    currentScreen: 'paymentHistory',
    companyId,
  })

  const handleEvent: OnEventType<EventType, unknown> = (event, payload) => {
    dispatch({ type: event as keyof typeof componentEvents, payload } as unknown as FlowAction)
    onEvent(event, payload)
  }

  switch (state.currentScreen) {
    case 'paymentHistory':
      return <PaymentHistory companyId={companyId} onEvent={handleEvent} />
    case 'createPayment':
      return (
        <CreatePayment
          companyId={companyId}
          paymentGroupId={state.paymentGroupId}
          onEvent={handleEvent}
        />
      )
    case 'overview':
      return (
        <Overview
          companyId={companyId}
          paymentGroupId={state.paymentGroupId || 'default'}
          onEvent={handleEvent}
        />
      )
    case 'detail':
      return <Detail companyId={companyId} date={state.selectedDate || ''} onEvent={handleEvent} />
    default:
      return <PaymentHistory companyId={companyId} onEvent={handleEvent} />
  }
}
