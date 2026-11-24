import { useTranslation } from 'react-i18next'
import { Industry as IndustryOnboardingForm } from '../onboarding'
import { Head } from '../onboarding/Head'
import { Edit } from '../onboarding/Edit'
import { useIndustryFormContext } from '../onboarding/Context'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
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

function IndustryManagementActions() {
  const { t } = useTranslation('Company.Industry')
  const { status } = useIndustryFormContext()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={status.isPending}>
        {t('saveCta')}
      </Components.Button>
    </ActionsLayout>
  )
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
 * Composes the onboarding form's own head and field with a Save button in place of its
 * Continue: a management edit has no next step to continue to.
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
    >
      <Head />
      <Edit />
      <IndustryManagementActions />
    </IndustryOnboardingForm>
  )
}
