import { state } from 'robot3'
// import type { PaymentMethodContextInterface } from './types'
// import { companyEvents, componentEvents } from '@/shared/constants'
// import type { MachineEventType } from '@/types/Helpers'

// export const cancelTransition = transition(
//   componentEvents.CANCEL,
//   'index',
//   reduce((ctx: PaymentMethodContextInterface) => ({
//     ...ctx,
//     component: LocationsListContextual,
//     locationId: undefined,
//   })),
// )

// const createReducer = (props: Partial<PaymentMethodContextInterface>) => {
//   return (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
//     ...ctx,
//     ...props,
//   })
// }

export const paymentMethodStateMachine = {
  index: state(),
}
