/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-parameters */
import type {
  Guard,
  Reducer,
  TransitionDefinition,
  StateDefinition,
  Machine,
  ContextFunction,
  SendEvent,
  Service,
} from './types'

/** @internal */
export function guard<C>(fn: (ctx: C, ev: any) => boolean): Guard<C> {
  return { _tag: 'guard', fn }
}

/** @internal */
export function reduce<C>(fn: (ctx: C, ev: any) => C): Reducer<C> {
  return { _tag: 'reduce', fn }
}

/** @internal */
export function transition<C = any>(
  event: string,
  target: string,
  ...modifiers: (Guard<C> | Reducer<C>)[]
): TransitionDefinition<C> {
  const guards: Guard<C>[] = []
  const reducers: Reducer<C>[] = []
  for (const mod of modifiers) {
    if (mod._tag === 'guard') guards.push(mod)
    else reducers.push(mod)
  }
  return { _tag: 'transition', event, target, guards, reducers }
}

/** @internal */
export function state<_T = unknown>(...transitions: TransitionDefinition[]): StateDefinition {
  const transitionMap = new Map<string, TransitionDefinition[]>()
  for (const def of transitions) {
    const existing = transitionMap.get(def.event)
    if (existing) {
      existing.push(def)
    } else {
      transitionMap.set(def.event, [def])
    }
  }
  return { _tag: 'state', transitions: transitionMap }
}

/** @internal */
export function createMachine<C>(
  initial: string,
  states: Record<string, StateDefinition>,
  contextFactory: ContextFunction<C>,
): Machine<object, C> {
  return { initial, states, contextFactory }
}

/** @internal */
export type TransitionResult<C> = { current: string; context: C }

/** @internal */
export function applyTransition<C>(
  states: Record<string, StateDefinition>,
  currentState: string,
  context: C,
  event: SendEvent,
): TransitionResult<C> | null {
  const stateDef = states[currentState]
  if (!stateDef) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[state-machine] Unknown state "${currentState}"`)
    }
    return null
  }

  const candidates = stateDef.transitions.get(event.type)
  if (!candidates || candidates.length === 0) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[state-machine] No transition for event "${event.type}" in state "${currentState}"`,
      )
    }
    return null
  }

  for (const candidate of candidates) {
    const allGuardsPass = candidate.guards.every(g => g.fn(context, event))
    if (!allGuardsPass) continue

    let nextContext = context
    for (const reducer of candidate.reducers) {
      nextContext = reducer.fn(nextContext, event) as C
    }

    return { current: candidate.target, context: nextContext }
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      `[state-machine] All guards failed for event "${event.type}" in state "${currentState}"`,
    )
  }
  return null
}

/** @internal */
export function interpret<C>(
  machine: Machine<object, C>,
  onChange: (service: Service<C>) => void,
  initialContext?: any,
): Service<C> {
  const context = machine.contextFactory(initialContext)

  const service: Service<C> = {
    machine: { current: machine.initial },
    context,
    send: (event: SendEvent) => {
      const result = applyTransition<C>(
        machine.states,
        service.machine.current,
        service.context,
        event,
      )
      if (result) {
        service.machine = { current: result.current }
        service.context = result.context
        onChange(service)
      }
    },
    child: undefined,
  }

  return service
}
