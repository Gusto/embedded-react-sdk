import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { createMachine, useMachine, state, transition, reduce } from '..'

type TestContext = { component: React.ComponentType | null; count: number }

const First = () => <div data-testid="first">First</div>
const Second = () => <div data-testid="second">Second</div>

function buildMachine(initial = 'a') {
  return createMachine<TestContext>(
    initial,
    {
      a: state(
        transition(
          'NEXT',
          'b',
          reduce((ctx: TestContext): TestContext => ({
            ...ctx,
            component: Second,
            count: ctx.count + 1,
          })),
        ),
      ),
      b: state(
        transition(
          'BACK',
          'a',
          reduce((ctx: TestContext): TestContext => ({
            ...ctx,
            component: First,
            count: ctx.count + 1,
          })),
        ),
      ),
    },
    (): TestContext => ({ component: First, count: 0 }),
  )
}

function TestHarness({ machine }: { machine: ReturnType<typeof buildMachine> }) {
  const [current, send] = useMachine(machine)
  const Component = current.context.component
  return (
    <div>
      <div data-testid="state">{current.name}</div>
      <div data-testid="count">{current.context.count}</div>
      {Component && <Component />}
      <button
        type="button"
        onClick={() => {
          send({ type: 'NEXT' })
        }}
      >
        next
      </button>
      <button
        type="button"
        onClick={() => {
          send({ type: 'BACK' })
        }}
      >
        back
      </button>
    </div>
  )
}

describe('useMachine', () => {
  it('renders the initial component from the machine context', () => {
    render(<TestHarness machine={buildMachine()} />)

    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('a')
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('transitions on dispatch and re-renders with the new component', () => {
    render(<TestHarness machine={buildMachine()} />)

    act(() => {
      screen.getByRole('button', { name: 'next' }).click()
    })

    expect(screen.getByTestId('second')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('b')
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('supports round-trip transitions', () => {
    render(<TestHarness machine={buildMachine()} />)

    act(() => {
      screen.getByRole('button', { name: 'next' }).click()
    })
    expect(screen.getByTestId('second')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: 'back' }).click()
    })
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('count')).toHaveTextContent('2')
  })

  it('provides a service object with machine.current and context', () => {
    let lastService: ReturnType<typeof useMachine<TestContext>>[2] | undefined

    function ServiceInspector({ machine }: { machine: ReturnType<typeof buildMachine> }) {
      const [, , service] = useMachine(machine)
      lastService = service
      return null
    }

    render(<ServiceInspector machine={buildMachine()} />)

    expect(lastService?.machine.current).toBe('a')
    expect(lastService?.context.count).toBe(0)
    expect(lastService?.child).toBeUndefined()
  })

  it('re-initializes when the machine reference changes', () => {
    const machine1 = buildMachine('a')
    const machine2 = buildMachine('b')

    const { rerender } = render(<TestHarness machine={machine1} />)
    expect(screen.getByTestId('state')).toHaveTextContent('a')

    rerender(<TestHarness machine={machine2} />)
    expect(screen.getByTestId('state')).toHaveTextContent('b')
  })

  it('passes initialContext through the context factory', () => {
    type Ctx = { label: string }
    const machine = createMachine<Ctx>('start', { start: state() }, (init?: Partial<Ctx>): Ctx => ({
      label: init?.label ?? 'default',
    }))

    function Inspector() {
      const [current] = useMachine(machine, { label: 'custom' })
      return <div data-testid="label">{current.context.label}</div>
    }

    render(<Inspector />)
    expect(screen.getByTestId('label')).toHaveTextContent('custom')
  })

  it('ignores events with no matching transition', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(<TestHarness machine={buildMachine()} />)

    act(() => {
      screen.getByRole('button', { name: 'back' }).click()
    })

    expect(screen.getByTestId('state')).toHaveTextContent('a')
    expect(screen.getByTestId('count')).toHaveTextContent('0')

    warnSpy.mockRestore()
  })
})
