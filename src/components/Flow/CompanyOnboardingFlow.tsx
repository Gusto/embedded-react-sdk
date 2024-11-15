// import { createMachine } from 'robot3'
// import { OverviewContextual } from '@/components/Company'
// import { Flow, type FlowContextInterface } from '@/components/Flow/Flow'
// import { companyOnboardingMachine } from '@/components/Flow/StateMachines'
// import type { BaseComponentInterface } from '@/components/Base'

// interface CompanyOnboardingFlowProps {
//   companyId: string
// }
// export interface CompanyOnboardingContextInterface extends FlowContextInterface {
//   companyId: string
// }
// //TODO: Revisit relationship with Base for flow components
// export const CompanyOnboardingFlow = ({
//   companyId,
//   onEvent,
// }: CompanyOnboardingFlowProps & BaseComponentInterface) => {
//   const companyOnboarding = createMachine(
//     'INDEX',
//     companyOnboardingMachine,
//     (initialContext: CompanyOnboardingContextInterface) => ({
//       ...initialContext,
//       component: OverviewContextual,
//       companyId,
//     }),
//   )
//   return <Flow machine={companyOnboarding} onEvent={onEvent} />
// }
