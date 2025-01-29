import { renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { useDataView } from '@/components/Common/DataView/useDataView'

// Mock data type
type MockData = {
  id: number
  name: string
  age: number
}

// Sample test data
const testData: MockData[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]

// Sample columns
const testColumns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
] as const

describe('useDataView Hook', () => {
  test('should return default values when no optional parameters are provided', () => {
    const { result } = renderHook(() => useDataView({ data: [], columns: [] }))

    expect(result.current.data).toEqual([])
    expect(result.current.columns).toEqual([])
    expect(result.current.defaultPageSize).toBe(25)
    expect(result.current.pageSizes).toEqual([10, 25, 50, 100])
    expect(result.current.pagination).toBeDefined()
  })

  test('should return provided data and columns', () => {
    const { result } = renderHook(() => useDataView({ data: testData, columns: [...testColumns] }))

    expect(result.current.data).toEqual(testData)
    expect(result.current.columns).toEqual(testColumns)
  })

  test('should return pagination controls', () => {
    const { result } = renderHook(() => useDataView({ data: testData, columns: [...testColumns] }))

    expect(result.current.pagination).toBeDefined()
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.handleNextPage).toBeInstanceOf(Function)
  })

  test('should return itemMenu and onSelect functions if provided', () => {
    const itemMenuMock = vi.fn((item: MockData) => {
      return <div>Menu for {item.name}</div>
    })
    const onSelectMock = vi.fn()

    const { result } = renderHook(() =>
      useDataView({
        data: testData,
        columns: [...testColumns],
        itemMenu: itemMenuMock,
        onSelect: onSelectMock,
      }),
    )

    expect(result.current.itemMenu).toBe(itemMenuMock)
    expect(result.current.onSelect).toBe(onSelectMock)
  })
})
