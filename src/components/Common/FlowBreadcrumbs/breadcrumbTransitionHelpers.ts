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
  return (targetState: string) =>
    transition(
      componentEvents.BREADCRUMB_NAVIGATE,
      targetState,
      guard((ctx: TContext, ev: { payload: { key: string } }) => ev.payload.key === targetState),
      reduce(
        (ctx: TContext, ev: BreadcrumbNavigateEvent<TContext>): TContext =>
          ev.payload.onNavigate(ctx),
      ),
    )
}
