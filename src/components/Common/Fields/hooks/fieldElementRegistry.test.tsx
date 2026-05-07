import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useFieldElementRegistry } from './fieldElementRegistry'

function makeElement(): HTMLElement {
  return document.createElement('input')
}

describe('FieldElementRegistry', () => {
  test('register stores the element under the given name', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current
    const input = makeElement()

    registry.register('firstName', input)

    expect(registry.get('firstName')).toBe(input)
    expect(registry.names()).toEqual(['firstName'])
  })

  test('register with null deletes the entry (cleanup path)', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current
    const input = makeElement()

    registry.register('firstName', input)
    expect(registry.get('firstName')).toBe(input)

    registry.register('firstName', null)

    expect(registry.get('firstName')).toBeNull()
    expect(registry.names()).toEqual([])
  })

  test('register with null is a no-op when the entry was never registered', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current

    expect(() => {
      registry.register('neverRegistered', null)
    }).not.toThrow()
    expect(registry.get('neverRegistered')).toBeNull()
    expect(registry.names()).toEqual([])
  })

  test('register with null only removes the targeted entry', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current
    const firstNameInput = makeElement()
    const lastNameInput = makeElement()

    registry.register('firstName', firstNameInput)
    registry.register('lastName', lastNameInput)

    registry.register('firstName', null)

    expect(registry.get('firstName')).toBeNull()
    expect(registry.get('lastName')).toBe(lastNameInput)
    expect(registry.names()).toEqual(['lastName'])
  })

  test('register with a new element overwrites the previous one', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current
    const firstInput = makeElement()
    const secondInput = makeElement()

    registry.register('firstName', firstInput)
    registry.register('firstName', secondInput)

    expect(registry.get('firstName')).toBe(secondInput)
    expect(registry.names()).toEqual(['firstName'])
  })

  test('get returns null for unknown names', () => {
    const { result } = renderHook(() => useFieldElementRegistry())
    const registry = result.current

    expect(registry.get('unknown')).toBeNull()
  })

  test('useFieldElementRegistry returns a stable instance across renders', () => {
    const { result, rerender } = renderHook(() => useFieldElementRegistry())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
