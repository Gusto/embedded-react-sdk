import { Industry as IndustryOnboardingForm } from '../onboarding'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link IndustryEditScreen}.
 *
 * @internal
 */
export interface IndustryEditScreenProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the screen emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. */
  LoaderComponent?: LoaderComponentType
}

/**
 * The industry form as a management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link Industry} block and
 * `CompanyManagement.DashboardFlow` — so the `company/industry/selected` →
 * `company/management/industry/updated` translation lives in one place that both reach,
 * rather than being duplicated in each machine.
 *
 * The onboarding event is forwarded unchanged alongside the management one; this wrapper adds
 * a signal, it does not replace one. The translation deliberately does not live inside
 * `CompanyOnboarding.Industry`: that component is an onboarding step too, and must not start
 * raising management events there.
 *
 * @param props - See {@link IndustryEditScreenProps}.
 * @returns The industry form wired for a management surface.
 * @internal
 */
export function IndustryEditScreen({
  companyId,
  onEvent,
  LoaderComponent,
}: IndustryEditScreenProps) {
  return (
    <IndustryOnboardingForm
      companyId={companyId}
      LoaderComponent={LoaderComponent}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_INDUSTRY_SELECTED]:
          componentEvents.COMPANY_MANAGEMENT_INDUSTRY_UPDATED,
      })}
    />
  )
}
