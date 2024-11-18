// import { transition, reduce, state } from 'robot3'
// import { IndustryContextual, OverviewContextual } from '@/components/Company'
// import { AddressesContextual } from '@/components/Company/Addresses'
// import { componentEvents } from '@/shared/constants'
// import type { CompanyOnboardingContextInterface } from '@/components/Flow/CompanyOnboardingFlow'

// // type MachineEventType = { type: EventType; payload: Record<string, unknown> };

// const cancelTransition = (target: string = 'INDEX', component?: React.ComponentType) =>
//   transition(
//     componentEvents.CANCEL,
//     target,
//     reduce(
//       (ctx: CompanyOnboardingContextInterface): CompanyOnboardingContextInterface => ({
//         ...ctx,
//         component: component ?? OverviewContextual,
//       }),
//     ),
//   )

// export const companyOnboardingMachine = {
//   INDEX: state(
//     transition(
//       componentEvents.COMPANY_INDUSTRY,
//       'INDUSTRY',
//       reduce(
//         (ctx: CompanyOnboardingContextInterface): CompanyOnboardingContextInterface => ({
//           ...ctx,
//           component: IndustryContextual,
//         }),
//       ),
//     ),
//     transition(
//       componentEvents.COMPANY_ADDRESSES,
//       'ADDRESSES',
//       reduce(
//         (ctx: CompanyOnboardingContextInterface): CompanyOnboardingContextInterface => ({
//           ...ctx,
//           component: AddressesContextual,
//         }),
//       ),
//     ),
//   ),
//   ADDRESSES: state(cancelTransition()),
//   INDUSTRY: state(
//     // transition(
//     //   componentEvents.COMPANY_ADDRESS,
//     //   'addEmployee',
//     //   reduce(
//     //     (ctx: CompanyOnboardingContextInterface): CompanyOnboardingContextInterface => ({
//     //       ...ctx,
//     //       component: AddEmployeeContextual,
//     //     }),
//     //   ),
//     // ),
//     cancelTransition('INDEX'),
//   ),
// }
