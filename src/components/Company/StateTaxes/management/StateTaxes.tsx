import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { createStateTaxesStateMachine } from '../stateTaxesStateMachine'
import type { StateTaxesContextInterface } from '../StateTaxesComponents'
import { StateTaxesManagementListContextual } from './StateTaxesManagementComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useComponentDictionary } from '@/i18n/I18n'

const stateTaxesManagementStateMachine = createStateTaxesStateMachine(
  StateTaxesManagementListContextual,
)

/**
 * Props for the management {@link StateTaxes} flow.
 *
 * @alpha
 */
export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** UUID of the company whose state taxes are being managed. */
  companyId: string
}

/**
 * Steady-state flow for reviewing a company's state tax setup and scheduling future-dated tax
 * rate changes, such as a new SUI rate from a state agency.
 *
 * @remarks
 * Opens on the list of states the company has tax requirements in. From each state's actions
 * menu the user either edits that state's requirements or opens its tax rate history, where
 * current, scheduled, and past rates are listed and a new rate can be scheduled for one of the
 * effective dates the state accepts. Both return to the list.
 *
 * Unlike `CompanyOnboarding.StateTaxes`, the list has no Continue button and no
 * self-onboarding warning: it is a resting screen with no next step, so this flow raises no
 * completion event.
 *
 * A scheduled rate cannot be cancelled: the tax requirements API has no operation for removing
 * a future-dated requirement set.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/stateTaxes/edit` | A state was selected for editing | `{ state: string }` |
 * | `company/stateTaxes/manageRates` | A state's tax rate history was opened | `{ state: string }` |
 * | `company/stateTaxes/updated` | A state's requirements were saved | — |
 * | `company/stateTaxes/rateScheduled` | A new effective-dated tax rate was saved. The API returns no body for this update, so the payload echoes what was saved | `{ state: string, key: string, effectiveFrom: string, requirements: { key: string, value: string }[] }` |
 * | `CANCEL` | Editing or the tax rate history was left and the list was shown again | — |
 *
 * @param props - See {@link StateTaxesProps}.
 * @returns The rendered state taxes management flow.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.StateTaxes
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })
  useComponentDictionary('Company.StateTaxes', dictionary)

  const machine = useMemo(
    () =>
      createMachine(
        'viewStateTaxes',
        stateTaxesManagementStateMachine,
        (initialContext: StateTaxesContextInterface) => ({
          ...initialContext,
          component: StateTaxesManagementListContextual,
          companyId,
          showContinueButton: false,
        }),
      ),
    [companyId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
