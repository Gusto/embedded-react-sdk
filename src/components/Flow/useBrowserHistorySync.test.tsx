import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMachine, guard, reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import { Flow } from './Flow'
import type { FlowContextInterface } from './useFlow'
import { useFlow } from './useFlow'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import type { MachineTransition } from '@/types/Helpers'

const NEXT_EVENT = componentEvents.EMPLOYEE_HOME_ADDRESS
const GOTO_EVENT = componentEvents.GOTO_STEP

const NextButton = () => {
  const { onEvent: emit } = useFlow()
  return (
    <button
      type="button"
      onClick={() => {
        emit(NEXT_EVENT, undefined)
      }}
    >
      next
    </button>
  )
}

const FirstScreen: ComponentType = () => (
  <div data-testid="first-screen">
    First
    <NextButton />
  </div>
)
const SecondScreen: ComponentType = () => (
  <div data-testid="second-screen">
    Second
    <NextButton />
  </div>
)
const ThirdScreen: ComponentType = () => <div data-testid="third-screen">Third</div>

function targetIs(name: string) {
  return guard(
    (_ctx: FlowContextInterface, ev: { payload: { target: string } }) => ev.payload.target === name,
  )
}

function gotoReducer(component: ComponentType) {
  return reduce((ctx: FlowContextInterface): FlowContextInterface => ({ ...ctx, component }))
}

const buildMachine = () => {
  const gotoTransitions = [
    transition(GOTO_EVENT, 'first', targetIs('first'), gotoReducer(FirstScreen)),
    transition(GOTO_EVENT, 'second', targetIs('second'), gotoReducer(SecondScreen)),
    transition(GOTO_EVENT, 'third', targetIs('third'), gotoReducer(ThirdScreen)),
  ]

  return createMachine(
    'first',
    {
      first: state<MachineTransition>(
        transition(
          NEXT_EVENT,
          'second',
          reduce(
            (ctx: FlowContextInterface): FlowContextInterface => ({
              ...ctx,
              component: SecondScreen,
            }),
          ),
        ),
        ...gotoTransitions,
      ),
      second: state<MachineTransition>(
        transition(
          NEXT_EVENT,
          'third',
          reduce(
            (ctx: FlowContextInterface): FlowContextInterface => ({
              ...ctx,
              component: ThirdScreen,
            }),
          ),
        ),
        ...gotoTransitions,
      ),
      third: state<MachineTransition>(...gotoTransitions),
    },
    (initialContext: FlowContextInterface): FlowContextInterface => ({
      ...initialContext,
      component: FirstScreen,
    }),
  )
}

const HISTORY_SYNC = {
  validStateNames: ['first', 'second', 'third'] as const,
  terminalStateNames: [] as const,
}

const HISTORY_SYNC_WITH_TERMINAL = {
  validStateNames: ['first', 'second', 'third'] as const,
  terminalStateNames: ['third'] as const,
}

describe('useBrowserHistorySync via Flow', () => {
  let pushSpy: MockInstance<History['pushState']>
  let replaceSpy: MockInstance<History['replaceState']>

  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    pushSpy = vi.spyOn(window.history, 'pushState')
    replaceSpy = vi.spyOn(window.history, 'replaceState')
  })

  afterEach(() => {
    pushSpy.mockRestore()
    replaceSpy.mockRestore()
    window.history.replaceState(null, '', '/')
  })

  it('stamps the entry URL with the initial state on mount', () => {
    const FirstWithButton: ComponentType = () => <NextButton />
    const machine = createMachine(
      'first',
      {
        first: state<MachineTransition>(),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({ ...ctx, component: FirstWithButton }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={vi.fn()} historySync={HISTORY_SYNC} />)

    expect(replaceSpy).toHaveBeenCalledWith({ sdkStep: 'first' }, '', '#step=first')
    expect(window.location.hash).toBe('#step=first')
  })

  it('does nothing when historySync is omitted', () => {
    const FirstWithButton: ComponentType = () => <NextButton />
    const machine = createMachine(
      'first',
      { first: state<MachineTransition>() },
      (ctx: FlowContextInterface): FlowContextInterface => ({ ...ctx, component: FirstWithButton }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={vi.fn()} />)

    expect(replaceSpy).not.toHaveBeenCalled()
    expect(pushSpy).not.toHaveBeenCalled()
    expect(window.location.hash).toBe('')
  })

  it('pushState on forward transitions', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Flow machine={buildMachine()} onEvent={vi.fn()} historySync={HISTORY_SYNC} />,
    )

    await user.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByTestId('second-screen')).toBeInTheDocument()
    expect(pushSpy).toHaveBeenCalledWith({ sdkStep: 'second' }, '', '#step=second')
    expect(window.location.hash).toBe('#step=second')
  })

  it('replaceState (not pushState) for a configured (from, to) transition', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Flow
        machine={buildMachine()}
        onEvent={vi.fn()}
        historySync={{
          validStateNames: ['first', 'second', 'third'],
          terminalStateNames: [],
          replaceStateTransitions: [{ from: 'second', to: 'third' }],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'next' }))
    pushSpy.mockClear()
    replaceSpy.mockClear()
    await user.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByTestId('third-screen')).toBeInTheDocument()
    expect(replaceSpy).toHaveBeenCalledWith({ sdkStep: 'third' }, '', '#step=third')
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('replaceState (not pushState) when entering a terminal state', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Flow machine={buildMachine()} onEvent={vi.fn()} historySync={HISTORY_SYNC_WITH_TERMINAL} />,
    )

    await user.click(screen.getByRole('button', { name: 'next' }))
    pushSpy.mockClear()
    replaceSpy.mockClear()
    await user.click(screen.getByRole('button', { name: 'next' }))

    expect(screen.getByTestId('third-screen')).toBeInTheDocument()
    expect(replaceSpy).toHaveBeenCalledWith({ sdkStep: 'third' }, '', '#step=third')
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('navigates the machine when popstate fires with a valid hash', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Flow machine={buildMachine()} onEvent={vi.fn()} historySync={HISTORY_SYNC} />,
    )

    await user.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByTestId('second-screen')).toBeInTheDocument()

    pushSpy.mockClear()

    act(() => {
      window.history.replaceState(null, '', '#step=first')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(screen.getByTestId('first-screen')).toBeInTheDocument()
    // The popstate-driven navigation must NOT push a new entry; that would defeat
    // the back button.
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('ignores popstate when the hash points to an unknown step', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Flow machine={buildMachine()} onEvent={vi.fn()} historySync={HISTORY_SYNC} />,
    )

    await user.click(screen.getByRole('button', { name: 'next' }))

    act(() => {
      window.history.replaceState(null, '', '#step=garbage')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(screen.getByTestId('second-screen')).toBeInTheDocument()
  })

  it('honors a deep link on mount', () => {
    window.history.replaceState(null, '', '#step=second')

    renderWithProviders(
      <Flow machine={buildMachine()} onEvent={vi.fn()} historySync={HISTORY_SYNC} />,
    )

    expect(screen.getByTestId('second-screen')).toBeInTheDocument()
  })
})
