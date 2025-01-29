import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataTable } from '@/components/Common/DataView/DataTable/DataTable'

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

describe('DataTable Component', () => {
  test('should render the table structure', () => {
    render(<DataTable data={[]} columns={[]} label="Test Table" />)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })

  test('should render the table with data and columns', () => {
    render(<DataTable data={testData} columns={[...testColumns]} label="Test Table" />)

    expect(screen.getAllByRole('row')).toHaveLength(testData.length + 1) // +1 for header
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render checkboxes and call onSelect when clicked', async () => {
    const onSelectMock = vi.fn()
    render(
      <DataTable
        data={testData}
        columns={[...testColumns]}
        onSelect={onSelectMock}
        label="Test Table"
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(testData.length)

    const firstCheckbox = checkboxes.at(0)
    expect(firstCheckbox).toBeDefined()

    if (firstCheckbox) {
      await userEvent.click(firstCheckbox)
      expect(onSelectMock).toHaveBeenCalledWith(testData[0])
    }
  })

  test('should render itemMenu when provided', () => {
    const itemMenuMock = vi.fn((item: MockData) => <div>Menu for {item.name}</div>)

    render(
      <DataTable
        data={testData}
        columns={[...testColumns]}
        itemMenu={itemMenuMock}
        label="Test Table"
      />,
    )

    expect(screen.getByText('Menu for Alice')).toBeInTheDocument()
    expect(screen.getByText('Menu for Bob')).toBeInTheDocument()
  })
})
