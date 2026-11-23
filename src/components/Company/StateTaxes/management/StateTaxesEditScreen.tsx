import { useMemo } from 'react'
import { createStateTaxesMachine } from '../shared/stateTaxesMachine'
import { StateTaxesManagementListContextual } from './StateTaxesManagementComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link StateTaxesEditScreen}.
 *
 * @internal
 */
export interface StateTaxesEditScreenProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** UUID of the company whose state taxes are being managed. */
  companyId: string
}

/**
 * The state tax list, requirements form and tax rate history as a single management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link StateTaxes} block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/stateTaxes/updated` lives in one place that both reach.
 *
 * Opens on the list of states the company has tax requirements in. From each state's actions
 * menu the user either edits that state's requirements or opens its tax rate history, where
 * current, scheduled and past rates are listed and a new rate can be scheduled for one of the
 * effective dates the state accepts. Both return to the list.
 *
 * Unlike `CompanyOnboarding.StateTaxes`, the list has no Continue button and no
 * self-onboarding warning: it is a resting screen with no next step, which is what makes
 * `company/stateTaxes/done` unnecessary here.
 *
 * A scheduled rate cannot be cancelled: the tax requirements API has no operation for removing
 * a future-dated requirement set.
 *
 * Both save events map to the same management event. A company often updates several states,
 * or schedules several rates, in one visit, so the hosting machine treats it as "stay" rather
 * than "leave".
 *
 * @param props - See {@link StateTaxesEditScreenProps}.
 * @returns The state taxes sub-flow wired for a management surface.
 * @internal
 */
export function StateTaxesEditScreen({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: StateTaxesEditScreenProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)

  const machine = useMemo(
    () => createStateTaxesMachine(StateTaxesManagementListContextual, { companyId }),
    [companyId],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.StateTaxesFlow"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow
        machine={machine}
        onEvent={translateEvents(onEvent, {
          [componentEvents.COMPANY_STATE_TAX_UPDATED]:
            componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_UPDATED,
          [componentEvents.COMPANY_STATE_TAX_RATE_SCHEDULED]:
            componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_UPDATED,
        })}
      />
    </BaseBoundaries>
  )
}
