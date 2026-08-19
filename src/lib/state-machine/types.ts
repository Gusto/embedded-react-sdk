/* eslint-disable @typescript-eslint/no-explicit-any */

/** @internal */
export type SendEvent = { type: string; payload?: unknown }

/** @internal */
export type SendFunction<T extends string = string> = (event: SendEvent | { type: T }) => void

/** @internal */
export type Guard<C = any> = {
  _tag: 'guard'
  fn: (ctx: C, ev: any) => boolean
}

/** @internal */
export type Reducer<C = any> = {
  _tag: 'reduce'
  fn: (ctx: C, ev: any) => C
}

/** @internal */
export type TransitionDefinition<C = any> = {
  _tag: 'transition'
  event: string
  target: string
  guards: Guard<C>[]
  reducers: Reducer<C>[]
}

/** @internal */
export type Transition<_E extends string = string> = TransitionDefinition
/** @internal */
export type Immediate<_E extends string = string> = TransitionDefinition

/** @internal */
export type StateDefinition<C = any> = {
  _tag: 'state'
  transitions: Map<string, TransitionDefinition<C>[]>
}

/** @internal */
export type ContextFunction<C = any> = (initialContext?: any) => C

/** @internal */
export type Machine<S extends object = object, C = any> = {
  initial: string
  states: Record<string, StateDefinition>
  contextFactory: ContextFunction<C>
}

/** @internal */
export type MachineState<C = any> = {
  name: string
  context: C
}

/** @internal */
export type Service<C = any> = {
  machine: { current: string }
  context: C
  send: SendFunction
  child: undefined
}

/** @internal */
export type GetMachineTransitions = TransitionDefinition
