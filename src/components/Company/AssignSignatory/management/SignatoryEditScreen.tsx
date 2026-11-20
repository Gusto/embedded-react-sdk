import { AssignSignatory } from '../onboarding'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link SignatoryEditScreen}.
 *
 * @internal
 */
export interface SignatoryEditScreenProps {
  /** The associated company identifier. */
  companyId: string
  /** The signatory being amended, or undefined when assigning someone new. */
  signatoryId?: string
  /** Callback invoked when the screen emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. */
  LoaderComponent?: LoaderComponentType
}

/**
 * The assign-signatory screens as a management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link Signatory} block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/signatory/updated` lives in one place that both reach.
 *
 * Translating *here* rather than inside `CreateSignatory` and `InviteSignatory` is what keeps
 * the signatory surface's save from being mistaken for someone else's.
 * `company/signatory/assignSignatory/done` is also raised by `DocumentSigner`'s own
 * assign-signatory step, reached from the document list; because that step does not go through
 * this wrapper, it raises no management signatory event and so cannot eject a user who merely
 * changed the signatory while reviewing documents.
 *
 * Passing no `signatoryId` assigns someone new; passing one amends that record.
 *
 * @param props - See {@link SignatoryEditScreenProps}.
 * @returns The assign-signatory screens wired for a management surface.
 * @internal
 */
export function SignatoryEditScreen({
  companyId,
  signatoryId,
  onEvent,
  LoaderComponent,
}: SignatoryEditScreenProps) {
  return (
    <AssignSignatory
      companyId={companyId}
      signatoryId={signatoryId}
      LoaderComponent={LoaderComponent}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE]:
          componentEvents.COMPANY_MANAGEMENT_SIGNATORY_UPDATED,
      })}
    />
  )
}
