import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  OnboardingOverviewContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export type { OnboardingFlowProps, OnboardingFlowDefaultValues } from './OnboardingFlowComponents'
/**
 * Orchestrated multi-step flow that guides a company through onboarding to Gusto Embedded Payroll.
 *
 * @remarks
 * The flow begins on the overview screen and steps through locations, federal taxes, industry,
 * bank account, employee onboarding, pay schedule, state taxes, and document signing before
 * returning to the overview.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/overview/continue` | User chose to continue to the next outstanding onboarding requirement | — |
 * | `company/overview/done` | User signaled they are done with the overview screen | — |
 * | `company/location/done` | User completed the locations step | — |
 * | `company/federalTaxes/done` | User completed the federal taxes step | — |
 * | `company/industry/selected` | User selected and saved an industry | The saved `industry` field from the update industry selection API |
 * | `company/bankAccount/done` | User completed the bank account step | — |
 * | `employee/onboarding/done` | User completed the embedded employee onboarding sub-flow | — |
 * | `paySchedule/done` | User completed the pay schedule step | — |
 * | `company/stateTaxes/done` | User completed the state taxes step | — |
 * | `company/forms/done` | User completed signing company documents | — |
 *
 * Each step is also exported as a standalone block (see the Sub-components
 * table) for composing a custom workflow when this orchestration is the wrong
 * fit. See the
 * {@link https://sdk.gusto.com/docs/integration-guide/composition | Composition guide}
 * for how to recompose these blocks into your own flow.
 *
 * @components
 * - {@link OnboardingOverview}
 * - {@link Locations}
 * - {@link FederalTaxes}
 * - {@link Industry}
 * - {@link BankAccount}
 * - Employee onboarding sub-flow (the embedded employee `OnboardingFlow`)
 * - {@link PaySchedule}
 * - {@link StateTaxes}
 * - {@link DocumentSigner}
 *
 * @param props - See {@link OnboardingFlowProps}.
 * @returns The multi-step company onboarding flow with internal navigation between the overview and the per-step screens.
 * @public
 */
export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const onboardingFlow = useMemo(
    () =>
      createMachine(
        'overview',
        onboardingMachine,
        (initialContext: OnboardingFlowContextInterface) => ({
          ...initialContext,
          component: OnboardingOverviewContextual,
          companyId,
          defaultValues,
        }),
      ),
    [companyId, defaultValues],
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
