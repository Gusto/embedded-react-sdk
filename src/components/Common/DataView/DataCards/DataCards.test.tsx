import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataCards } from '@/components/Common/DataView/DataCards/DataCards'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'

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

// Reusable test wrapper
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<GustoTestApiProvider>{ui}</GustoTestApiProvider>)
}

describe('DataCards', () => {
  test('should render the component', () => {
    renderWithProvider(<DataCards data={[]} columns={[]} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  test('should render the component with data', () => {
    renderWithProvider(<DataCards data={testData} columns={[...testColumns]} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render the component with column headers', () => {
    renderWithProvider(<DataCards data={testData} columns={[...testColumns]} />)

    expect(screen.getAllByText('Name').length).toBe(testData.length)
    expect(screen.getAllByText('Age').length).toBe(testData.length)
  })

  test('should render the component with custom rendering', () => {
    renderWithProvider(
      <DataCards
        data={testData}
        columns={[
          {
            key: 'name',
            title: 'Custom Name',
            render: (item: MockData) => `Hello, ${item.name}!`,
          },
        ]}
      />,
    )

    expect(screen.getAllByText('Custom Name').length).toBeGreaterThan(0)
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument()
  })

  test('should call onSelect when an item is clicked', async () => {
    const onSelectMock = vi.fn()
    renderWithProvider(
      <DataCards data={testData} columns={[...testColumns]} onSelect={onSelectMock} />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)

    if (checkboxes.length === 0) return

    await userEvent.click(checkboxes[0] as HTMLElement)
    expect(onSelectMock).toHaveBeenCalledWith(testData[0], true)
  })
})
