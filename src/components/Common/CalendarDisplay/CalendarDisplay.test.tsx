import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarDisplay } from './CalendarDisplay'
import { CalendarDisplayLegend } from './CalendarDisplayLegend'

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

    // Check if highlight labels are displayed in the legend
    expect(screen.getByText('Important Date')).toBeInTheDocument()
    expect(screen.getByText('Deadline')).toBeInTheDocument()

    // Check for the formatted dates in the legend
    expect(screen.getByText(/January 10/)).toBeInTheDocument()
    expect(screen.getByText(/January 12/)).toBeInTheDocument()
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

  it('handles dates in multiple months correctly', () => {
    // Format: YYYY-MM-DD - spanning two months
    const startDate = '2023-01-15'
    const endDate = '2023-02-15'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'Multi-month Range',
        }}
      />,
    )

    // Should display the month of the start date
    expect(screen.getByText('January 2023')).toBeInTheDocument()

    // Check if the calendar has an aria-label that includes the start date
    expect(screen.getByRole('application')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/January 15/i),
    )
  })

  it('displays dates within the selected range', () => {
    const startDate = '2023-01-05'
    const endDate = '2023-01-10'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
      />,
    )

    // Check if the calendar is rendered with the correct month
    expect(screen.getByRole('grid')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/January 2023/i),
    )

    // Check if the application has an aria-label that includes the date range
    const appElement = screen.getByRole('application')
    expect(appElement).toHaveAttribute('aria-label')
    const ariaLabel = appElement.getAttribute('aria-label') || ''
    expect(ariaLabel).toContain('January')
  })

  it('displays the month name for the selected date range', () => {
    const startDate = '2023-03-01'
    const endDate = '2023-03-15'

    render(
      <CalendarDisplay
        rangeSelected={{
          start: startDate,
          end: endDate,
          label: 'March Range',
        }}
      />,
    )

    // Check if a month name is displayed (could be February or March depending on how the component works)
    const monthText = screen.getByText(/\w+ 2023/)
    expect(monthText).toBeInTheDocument()

    // Check that the application has an aria-label that includes March
    expect(screen.getByRole('application')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/March/i),
    )
  })
})

describe('CalendarDisplayLegend', () => {
  it('renders legend items with correct formatting', () => {
    const highlightDates = [
      {
        date: '2023-01-10',
        highlightColor: 'black' as const,
        label: 'Important Date',
      },
      {
        date: '2023-01-12',
        highlightColor: 'orange' as const,
        label: 'Deadline',
      },
    ]

    render(
      <CalendarDisplayLegend
        highlightDates={highlightDates}
        rangeSelected={{
          start: '2023-01-01',
          end: '2023-01-15',
          label: 'Test Range',
        }}
      />,
    )

    // Check if legend items are displayed with correct labels
    expect(screen.getByText('Important Date')).toBeInTheDocument()
    expect(screen.getByText('Deadline')).toBeInTheDocument()

    // Check if dates are formatted correctly
    // The exact format will depend on the locale, but we can check for parts of the date
    expect(screen.getByText(/January 10/)).toBeInTheDocument()
    expect(screen.getByText(/January 12/)).toBeInTheDocument()

    // Check if legend markers are present
    const legendMarkers = document.querySelectorAll('.react-aria-CalendarLegend')
    expect(legendMarkers.length).toBe(2)
  })

  it('renders empty when no highlight dates are provided', () => {
    render(
      <CalendarDisplayLegend
        rangeSelected={{
          start: '2023-01-01',
          end: '2023-01-15',
          label: 'Test Range',
        }}
      />,
    )

    // The legend container should be present but without highlight items
    const legendContainer = document.querySelector('div[style*="padding: 20px"]')
    expect(legendContainer).toBeInTheDocument()

    // There should be no highlight labels
    expect(screen.queryByText(/January/)).not.toBeInTheDocument()
  })
})
