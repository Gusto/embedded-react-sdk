import { FederalTaxes as FederalTaxesOnboardingForm } from '../onboarding'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link FederalTaxesEditScreen}.
 *
 * @internal
 */
export interface FederalTaxesEditScreenProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the screen emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. */
  LoaderComponent?: LoaderComponentType
}

/**
 * The federal tax details form as a management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link FederalTaxes} block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/federalTaxes/updated` lives in one place that both reach.
 *
 * Maps the form's `company/federalTaxes/updated` rather than the `company/federalTaxes/done`
 * that follows it: both fire exactly once per save, but only the former carries the updated
 * details, so mapping it gives the management event the API response as its payload.
 *
 * Both onboarding events are still forwarded unchanged; this wrapper adds a signal rather
 * than replacing one.
 *
 * @param props - See {@link FederalTaxesEditScreenProps}.
 * @returns The federal tax details form wired for a management surface.
 * @internal
 */
export function FederalTaxesEditScreen({
  companyId,
  onEvent,
  LoaderComponent,
}: FederalTaxesEditScreenProps) {
  return (
    <FederalTaxesOnboardingForm
      companyId={companyId}
      LoaderComponent={LoaderComponent}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_FEDERAL_TAXES_UPDATED]:
          componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_UPDATED,
      })}
    />
  )
}
