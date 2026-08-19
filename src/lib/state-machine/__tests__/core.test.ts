import { describe, it, expect, vi } from 'vitest'
import {
  guard,
  reduce,
  transition,
  state,
  createMachine,
  interpret,
  applyTransition,
} from '../core'

describe('state machine core', () => {
  describe('applyTransition', () => {
    it('transitions to a new state and applies the reducer', () => {
      const states = {
        a: state(
          transition(
            'GO',
            'b',
            reduce((ctx: { count: number }) => ({ ...ctx, count: ctx.count + 1 })),
          ),
        ),
        b: state(),
      }

      const result = applyTransition(states, 'a', { count: 0 }, { type: 'GO' })

      expect(result).toMatchObject({ current: 'b', context: { count: 1 } })
    })

    it('returns null for unhandled events', () => {
      const states = {
        a: state(transition('GO', 'b')),
      }

      const result = applyTransition(states, 'a', {}, { type: 'UNKNOWN' })

      expect(result).toBeNull()
    })

    it('evaluates guards and picks the first matching transition', () => {
      const states = {
        a: state(
          transition(
            'GO',
            'b',
            guard((ctx: { val: string }) => ctx.val === 'yes'),
          ),
          transition('GO', 'c'),
        ),
      }

      expect(applyTransition(states, 'a', { val: 'no' }, { type: 'GO' })).toMatchObject({
        current: 'c',
      })
      expect(applyTransition(states, 'a', { val: 'yes' }, { type: 'GO' })).toMatchObject({
        current: 'b',
      })
    })

    it('composes multiple guards with AND', () => {
      const states = {
        a: state(
          transition(
            'GO',
            'b',
            guard((_ctx: { x: number }) => true),
            guard((ctx: { x: number }) => ctx.x > 5),
          ),
        ),
      }

      expect(applyTransition(states, 'a', { x: 3 }, { type: 'GO' })).toBeNull()
      expect(applyTransition(states, 'a', { x: 10 }, { type: 'GO' })).toMatchObject({
        current: 'b',
      })
    })

    it('pipes reducers in order', () => {
      const states = {
        a: state(
          transition(
            'GO',
            'b',
            reduce((ctx: { items: string[] }) => ({ ...ctx, items: [...ctx.items, 'first'] })),
            reduce((ctx: { items: string[] }) => ({ ...ctx, items: [...ctx.items, 'second'] })),
          ),
        ),
        b: state(),
      }

      const result = applyTransition(states, 'a', { items: [] }, { type: 'GO' })

      expect(result).toMatchObject({
        current: 'b',
        context: { items: ['first', 'second'] },
      })
    })

    it('passes the event to reducers', () => {
      const states = {
        a: state(
          transition(
            'SET',
            'b',
            reduce((_ctx: { value: string }, ev: { payload: string }) => ({
              value: ev.payload,
            })),
          ),
        ),
        b: state(),
      }

      const result = applyTransition(states, 'a', { value: '' }, { type: 'SET', payload: 'hello' })

      expect(result).toMatchObject({
        current: 'b',
        context: { value: 'hello' },
      })
    })

    it('passes the event to guards', () => {
      const states = {
        a: state(
          transition(
            'GO',
            'b',
            guard((_ctx: object, ev: { payload: { allowed: boolean } }) => ev.payload.allowed),
          ),
        ),
      }

      expect(
        applyTransition(states, 'a', {}, { type: 'GO', payload: { allowed: false } }),
      ).toBeNull()
      expect(
        applyTransition(states, 'a', {}, { type: 'GO', payload: { allowed: true } }),
      ).toMatchObject({ current: 'b' })
    })

    it('warns in dev mode for unhandled events', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const states = { a: state() }

      applyTransition(states, 'a', {}, { type: 'NOPE' })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No transition for event "NOPE" in state "a"'),
      )
      warnSpy.mockRestore()
    })
  })

  describe('createMachine', () => {
    it('stores the initial state, states, and context factory', () => {
      const factory = () => ({ value: 42 })
      const machine = createMachine('start', { start: state() }, factory)

      expect(machine.initial).toBe('start')
      expect(machine.states.start).toBeDefined()
      expect(machine.contextFactory()).toMatchObject({ value: 42 })
    })
  })

  describe('interpret', () => {
    it('creates a service with the initial state and context', () => {
      const machine = createMachine('idle', { idle: state(), active: state() }, () => ({
        count: 0,
      }))

      const service = interpret(machine, () => {})

      expect(service.machine.current).toBe('idle')
      expect(service.context).toMatchObject({ count: 0 })
      expect(service.child).toBeUndefined()
    })

    it('transitions on send and calls onChange', () => {
      const machine = createMachine(
        'a',
        {
          a: state(
            transition(
              'NEXT',
              'b',
              reduce((ctx: { step: number }) => ({ step: ctx.step + 1 })),
            ),
          ),
          b: state(),
        },
        () => ({ step: 0 }),
      )

      const onChange = vi.fn()
      const service = interpret(machine, onChange)

      service.send({ type: 'NEXT' })

      expect(service.machine.current).toBe('b')
      expect(service.context).toMatchObject({ step: 1 })
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does not call onChange when no transition matches', () => {
      const machine = createMachine('a', { a: state() }, () => ({}))

      const onChange = vi.fn()
      const service = interpret(machine, onChange)

      service.send({ type: 'UNKNOWN' })

      expect(service.machine.current).toBe('a')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('passes initialContext through the context factory', () => {
      const machine = createMachine('start', { start: state() }, (init: { id?: string } = {}) => ({
        id: init.id ?? 'default',
      }))

      const service = interpret(machine, () => {}, { id: 'custom' })

      expect(service.context).toMatchObject({ id: 'custom' })
    })

    it('supports sequential transitions', () => {
      const machine = createMachine(
        'a',
        {
          a: state(transition('NEXT', 'b')),
          b: state(transition('NEXT', 'c')),
          c: state(),
        },
        () => ({}),
      )

      const service = interpret(machine, () => {})

      service.send({ type: 'NEXT' })
      expect(service.machine.current).toBe('b')

      service.send({ type: 'NEXT' })
      expect(service.machine.current).toBe('c')
    })
  })
})
