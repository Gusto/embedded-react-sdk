import type { OnEventType } from '@/components/Base'
import type { EventType } from '@/shared/constants'

/**
 * Wraps an `onEvent` so that chosen events also raise a management-scoped counterpart.
 *
 * @remarks
 * A CompanyManagement block mounts the section's existing flow, which raises that flow's own
 * events. Rather than teach those screens a second vocabulary — they are onboarding steps too,
 * and must keep behaving like them — the management wrapper translates at the boundary.
 *
 * The original event is always forwarded **first and unchanged**; the mapped event is raised
 * *in addition to* it, never instead of it. A partner listening for the onboarding event keeps
 * hearing it; the management event exists so the surrounding machine has a signal scoped to the
 * surface that produced it.
 *
 * That ordering is load-bearing. Hosting machines declare no transition for the onboarding
 * event, so the first call is a no-op and the second is what transitions. Do not collapse the
 * two calls or drop the pass-through.
 *
 * Translating here rather than inside the mounted screens also keeps a screen that several
 * surfaces share from emitting an event only one of them should act on — `CreateSignatory` is
 * reached from both the signatory surface and the document list, and only the former should
 * read a save as "the signatory section was updated".
 *
 * `Flow` passes `onEvent` as its machine's initial context, so the handler a contextual
 * component sees is fixed at mount. A fresh wrapper per render is therefore fine, but never
 * close a per-render value into one: it is captured once and never refreshed.
 *
 * @param onEvent - The host's event handler.
 * @param mapping - Inner event to the management event it should additionally raise.
 * @returns An `onEvent` that forwards every event and appends the mapped ones.
 * @internal
 */
export function translateEvents(
  onEvent: OnEventType<EventType, unknown>,
  mapping: Partial<Record<EventType, EventType>>,
): OnEventType<EventType, unknown> {
  return (type, data) => {
    onEvent(type, data)
    const managementEvent = mapping[type]
    if (managementEvent) {
      onEvent(managementEvent, data)
    }
  }
}
