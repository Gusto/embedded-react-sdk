import { guard, reduce, transition } from 'robot3'
import { componentEvents } from '@/shared/constants'

type BreadcrumbNavigateEvent<TContext> = {
  payload: {
    key: string
    onNavigate: (ctx: TContext) => TContext
  }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const createBreadcrumbNavigateTransition = <TContext>() => {
  return (targetState: string, canNavigate?: (ctx: TContext) => boolean) =>
    transition(
      componentEvents.BREADCRUMB_NAVIGATE,
      targetState,
      guard(
        (ctx: TContext, ev: { payload: { key: string } }) =>
          ev.payload.key === targetState && (canNavigate?.(ctx) ?? true),
      ),
      reduce(
        (ctx: TContext, ev: BreadcrumbNavigateEvent<TContext>): TContext =>
          ev.payload.onNavigate(ctx),
      ),
    )
}
