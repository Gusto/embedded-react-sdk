/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useRef } from 'react'
import { applyTransition } from './core'
import type { Machine, MachineState, SendEvent, Service, StateDefinition } from './types'

export { guard, reduce, transition, state, createMachine, interpret } from './core'
export type {
  Guard,
  Reducer,
  TransitionDefinition,
  StateDefinition,
  Machine,
  MachineState,
  Service,
  SendFunction,
  SendEvent,
  ContextFunction,
  Transition,
  Immediate,
  GetMachineTransitions,
} from './types'

type ReducerState<C> = { current: string; context: C }

type ReducerAction<C> = SendEvent | { type: '__RESET__'; _initial: string; _context: C }

function machineReducer<C>(
  machineStates: Record<string, StateDefinition>,
  state: ReducerState<C>,
  action: ReducerAction<C>,
): ReducerState<C> {
  if (action.type === '__RESET__' && '_initial' in action) {
    return { current: action._initial, context: action._context }
  }
  return (
    applyTransition<C>(machineStates, state.current, state.context, action as SendEvent) ?? state
  )
}

/** @internal */
export function useMachine<C>(
  machine: Machine<object, C>,
  initialContext?: any,
): [MachineState<C>, (event: SendEvent) => void, Service<C>] {
  const machineRef = useRef(machine)

  const [{ current, context }, dispatch] = useReducer(
    (s: ReducerState<C>, a: ReducerAction<C>) => machineReducer(machineRef.current.states, s, a),
    undefined,
    () => ({
      current: machine.initial,
      context: machine.contextFactory(initialContext),
    }),
  )

  if (machineRef.current !== machine) {
    machineRef.current = machine
    const resetContext = machine.contextFactory(initialContext)
    dispatch({ type: '__RESET__', _initial: machine.initial, _context: resetContext })
  }

  const send = (event: SendEvent) => {
    dispatch(event)
  }

  const currentState: MachineState<C> = { name: current, context }
  const service: Service<C> = {
    machine: { current },
    context,
    send,
    child: undefined,
  }

  return [currentState, send, service]
}
