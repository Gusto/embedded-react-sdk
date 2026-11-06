import { describe, expect, it, vi } from 'vitest'
import { getSortControls } from './getSortControls'

describe('getSortControls', () => {
  it('reports the direction of the column it was built for, and none for any other', () => {
    const current = { columnKey: 'name', direction: 'descending' } as const

    expect(getSortControls('name', current, vi.fn()).sortDirection).toBe('descending')
    expect(getSortControls('email', current, vi.fn()).sortDirection).toBe('none')
    expect(getSortControls('name', undefined, vi.fn()).sortDirection).toBe('none')
  })

  it.each([
    [undefined, { columnKey: 'name', direction: 'ascending' }],
    [
      { columnKey: 'name', direction: 'ascending' } as const,
      { columnKey: 'name', direction: 'descending' },
    ],
    [{ columnKey: 'name', direction: 'descending' } as const, undefined],
  ])('cycles none to ascending to descending and back to none', (current, expected) => {
    const onSortChange = vi.fn()

    getSortControls('name', current, onSortChange).onSort()

    expect(onSortChange).toHaveBeenCalledWith(expected)
  })

  it('applies each explicit sort regardless of the current direction', () => {
    const onSortChange = vi.fn()
    const controls = getSortControls(
      'name',
      { columnKey: 'name', direction: 'ascending' },
      onSortChange,
    )

    controls.onSortAscending()
    expect(onSortChange).toHaveBeenLastCalledWith({ columnKey: 'name', direction: 'ascending' })

    controls.onSortDescending()
    expect(onSortChange).toHaveBeenLastCalledWith({ columnKey: 'name', direction: 'descending' })

    controls.onClearSort()
    expect(onSortChange).toHaveBeenLastCalledWith(undefined)
  })
})
