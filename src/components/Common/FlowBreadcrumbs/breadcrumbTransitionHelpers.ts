import { guard, reduce, transition } from 'robot3'
import { componentEvents } from '@/shared/constants'

type BreadcrumbNavigateEvent<TContext> = {
  payload: {
    key: string
    onNavigate: (ctx: TContext) => TContext
  }
}

/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/**
 * Builds a factory that produces robot3 transitions handling a
 * `breadcrumb/navigate` event for a given target state.
 *
 * @remarks
 * The returned factory takes a target state name and an optional `canNavigate`
 * guard. The resulting transition only fires when the event payload's `key`
 * matches the target state and the guard (if provided) returns true, then
 * reduces the machine context by invoking the breadcrumb's `onNavigate`. The
 * outer generic is used purely to anchor `TContext` for the inner closures.
 *
 * @typeParam TContext - The state machine context shape.
 * @returns A factory `(targetState, canNavigate?) => transition` that emits a
 * guarded robot3 transition for the `breadcrumb/navigate` event.
 * @internal
 */
export const createBreadcrumbNavigateTransition = <TContext>() => {
  /* eslint-enable @typescript-eslint/no-unnecessary-type-parameters */
  return (targetState: string, canNavigate?: (ctx: TContext) => boolean) =>
    transition(
      componentEvents.BREADCRUMB_NAVIGATE,
      targetState,
      guard(
        (ctx: TContext, ev: { payload: { key: string } }) =>
          ev.payload.key === targetState && (canNavigate?.(ctx) ?? true),
      ),
      reduce((ctx: TContext, ev: BreadcrumbNavigateEvent<TContext>): TContext =>
        ev.payload.onNavigate(ctx),
      ),
    )
}
