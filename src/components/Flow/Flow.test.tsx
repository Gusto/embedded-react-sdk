import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMachine, reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import { Flow } from './Flow'
import type { FlowContextInterface } from './useFlow'
import { useFlow } from './useFlow'
import { componentEvents, type EventType } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import type { MachineTransition } from '@/types/Helpers'

const FirstScreen: ComponentType = () => <div data-testid="first-screen">First</div>
const SecondScreen: ComponentType = () => <div data-testid="second-screen">Second</div>

const NEXT_EVENT = componentEvents.EMPLOYEE_HOME_ADDRESS
const BACK_EVENT = componentEvents.CANCEL

const buildMachine = (overrides: Partial<FlowContextInterface> = {}) =>
  createMachine(
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
              header: { type: 'minimal' },
            }),
          ),
        ),
      ),
      second: state<MachineTransition>(
        transition(
          BACK_EVENT,
          'first',
          reduce(
            (ctx: FlowContextInterface): FlowContextInterface => ({
              ...ctx,
              component: FirstScreen,
              header: null,
            }),
          ),
        ),
      ),
    },
    (initialContext: FlowContextInterface): FlowContextInterface => ({
      ...initialContext,
      component: FirstScreen,
      ...overrides,
    }),
  )

describe('Flow', () => {
  it('renders the initial component from the state machine context', () => {
    const onEvent = vi.fn()
    renderWithProviders(<Flow machine={buildMachine()} onEvent={onEvent} />)

    expect(screen.getByTestId('first-screen')).toBeInTheDocument()
  })

  it('renders nothing for the active component slot when context.component is null', () => {
    const onEvent = vi.fn()
    renderWithProviders(<Flow machine={buildMachine({ component: null })} onEvent={onEvent} />)

    expect(screen.queryByTestId('first-screen')).not.toBeInTheDocument()
    expect(screen.queryByTestId('second-screen')).not.toBeInTheDocument()
  })

  it('does not render a header when the initial context has none', () => {
    const onEvent = vi.fn()
    renderWithProviders(<Flow machine={buildMachine()} onEvent={onEvent} />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('forwards events to the host via onEvent', () => {
    const onEvent = vi.fn()
    const ChildThatEmits = () => {
      const { onEvent: emit } = useFlow()
      return (
        <button
          type="button"
          onClick={() => {
            emit(NEXT_EVENT, { foo: 'bar' })
          }}
        >
          go
        </button>
      )
    }
    const machine = createMachine(
      'first',
      {
        first: state<MachineTransition>(),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({
        ...ctx,
        component: ChildThatEmits,
      }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={onEvent} />)

    screen.getByRole('button', { name: 'go' }).click()

    expect(onEvent).toHaveBeenCalledWith(NEXT_EVENT, { foo: 'bar' })
  })

  it('drives state machine transitions when child components emit events', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    const ChildThatEmits = ({ event }: { event: EventType }) => {
      const { onEvent: emit } = useFlow()
      return (
        <button
          type="button"
          onClick={() => {
            emit(event, undefined)
          }}
        >
          {event}
        </button>
      )
    }
    const FirstWithButton = () => <ChildThatEmits event={NEXT_EVENT} />
    const SecondWithButton = () => <ChildThatEmits event={BACK_EVENT} />

    const machine = createMachine(
      'first',
      {
        first: state<MachineTransition>(
          transition(
            NEXT_EVENT,
            'second',
            reduce(
              (ctx: FlowContextInterface): FlowContextInterface => ({
                ...ctx,
                component: SecondWithButton,
                header: { type: 'minimal' },
              }),
            ),
          ),
        ),
        second: state<MachineTransition>(
          transition(
            BACK_EVENT,
            'first',
            reduce(
              (ctx: FlowContextInterface): FlowContextInterface => ({
                ...ctx,
                component: FirstWithButton,
                header: null,
              }),
            ),
          ),
        ),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({
        ...ctx,
        component: FirstWithButton,
      }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={onEvent} />)

    expect(screen.getByRole('button', { name: NEXT_EVENT })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: NEXT_EVENT }))

    expect(screen.getByRole('button', { name: BACK_EVENT })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: NEXT_EVENT })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: BACK_EVENT }))

    expect(screen.getByRole('button', { name: NEXT_EVENT })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: BACK_EVENT })).not.toBeInTheDocument()
  })

  it('renders the FlowHeader when the active state contributes a header config', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    const ChildThatEmits = () => {
      const { onEvent: emit } = useFlow()
      return (
        <button
          type="button"
          onClick={() => {
            emit(NEXT_EVENT, undefined)
          }}
        >
          go
        </button>
      )
    }

    const machine = createMachine(
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
                header: { type: 'minimal' },
              }),
            ),
          ),
        ),
        second: state<MachineTransition>(),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({
        ...ctx,
        component: ChildThatEmits,
      }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={onEvent} />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('second-screen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('emits CANCEL via the FlowHeader Back button and routes it through the state machine', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    const machine = createMachine(
      'second',
      {
        first: state<MachineTransition>(),
        second: state<MachineTransition>(
          transition(
            BACK_EVENT,
            'first',
            reduce(
              (ctx: FlowContextInterface): FlowContextInterface => ({
                ...ctx,
                component: FirstScreen,
                header: null,
              }),
            ),
          ),
        ),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({
        ...ctx,
        component: SecondScreen,
        header: { type: 'minimal' },
      }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={onEvent} />)

    expect(screen.getByTestId('second-screen')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(onEvent).toHaveBeenCalledWith(BACK_EVENT, undefined)
    expect(screen.getByTestId('first-screen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('exposes defaultValues through the flow context', () => {
    const onEvent = vi.fn()
    const Inspector = () => {
      const { defaultValues } = useFlow()
      return <div data-testid="default-values">{JSON.stringify(defaultValues)}</div>
    }
    const machine = createMachine(
      'first',
      {
        first: state<MachineTransition>(),
      },
      (ctx: FlowContextInterface): FlowContextInterface => ({
        ...ctx,
        component: Inspector,
        defaultValues: { firstName: 'Ada' },
      }),
    )

    renderWithProviders(<Flow machine={machine} onEvent={onEvent} />)

    expect(screen.getByTestId('default-values')).toHaveTextContent('{"firstName":"Ada"}')
  })
})
