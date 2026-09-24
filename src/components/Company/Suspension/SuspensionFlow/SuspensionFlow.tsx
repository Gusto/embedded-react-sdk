import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import { suspensionMachine, suspensionInitialComponent } from './suspensionStateMachine'
import {
  type SuspensionFlowContextInterface,
  type SuspensionFlowProps,
} from './SuspensionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries } from '@/components/Base'
import { useI18n } from '@/i18n'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

function SuspensionFlowContent({ companyId, onEvent, LoaderComponent }: SuspensionFlowProps) {
  useI18n('Company.Suspension.Form')
  useI18n('Company.Suspension.Summary')

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const initialState = company?.isSuspended ? 'summary' : 'form'

  const machine = useMemo(
    () =>
      createMachine(initialState, suspensionMachine, (ctx: SuspensionFlowContextInterface) => ({
        ...ctx,
        component: suspensionInitialComponent[initialState],
        companyId,
        LoaderComponent,
      })),
    [initialState, companyId, LoaderComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Guided flow to suspend ("cancel") a company's Gusto account and confirm the outcome.
 *
 * @remarks
 * Requires the `companySuspension` unstable feature flag to be enabled via {@link GustoProvider}.
 *
 * Collects the reason and tax-reconciliation preferences, submits the suspension, then shows a
 * read-only summary of what Gusto will handle. When the company is already suspended, the flow
 * skips the form and opens directly on the summary of the latest suspension.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/suspension/created` | The suspension was successfully created | {@link APIModels.CompanySuspension} |
 * | `company/suspension/done` | The user acknowledged the summary and finished the flow | — |
 *
 * @param props - {@link SuspensionFlowProps}.
 * @returns The rendered company suspension flow.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { CompanyManagement, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <CompanyManagement.SuspensionFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'company/suspension/done') {
 *           // Suspension flow complete — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function SuspensionFlow({
  companyId,
  onEvent,
  FallbackComponent,
  LoaderComponent,
}: SuspensionFlowProps) {
  useUnstableFeature('companySuspension', { throwIfDisabled: true })
  return (
    <BaseBoundaries
      componentName="Company.Suspension"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <SuspensionFlowContent
        companyId={companyId}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </BaseBoundaries>
  )
}
