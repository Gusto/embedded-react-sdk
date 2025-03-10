import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarDisplay } from './CalendarDisplay'

describe('CalendarDisplay', () => {
  it('renders the calendar with selected range', () => {
    // Format: YYYY-MM-DD
    const startDate = '2023-01-01'
    const endDate = '2023-01-15'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
      />,
    )

    // Check if the month and year are displayed in the table aria-label
    expect(screen.getByRole('grid', { name: 'January 2023' })).toBeInTheDocument()

    // Check if the range is displayed in the calendar's aria-label
    expect(screen.getByRole('application', { name: /January 1 to/i })).toBeInTheDocument()
  })

  it('renders with highlight dates', () => {
    // Format: YYYY-MM-DD
    const startDate = '2023-01-01'
    const endDate = '2023-01-15'
    const highlightDate1 = '2023-01-10'
    const highlightDate2 = '2023-01-12'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
        highlightDates={[
          {
            date: highlightDate1,
            highlightColor: 'black',
            label: 'Important Date',
          },
          {
            date: highlightDate2,
            highlightColor: 'orange',
            label: 'Deadline',
          },
        ]}
      />,
    )

    // Check if highlight labels are displayed
    expect(screen.getByText('Important Date')).toBeInTheDocument()
    expect(screen.getByText('Deadline')).toBeInTheDocument()
  })

  it('renders with selection control', () => {
    // Format: YYYY-MM-DD
    const startDate = '2023-01-01'
    const endDate = '2023-01-15'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
        selectionControl={<div data-testid="selection-control">Selection Control</div>}
      />,
    )

    // Check if selection control is rendered
    expect(screen.getByTestId('selection-control')).toBeInTheDocument()
  })
})
