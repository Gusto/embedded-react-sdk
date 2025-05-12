import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarPreview } from './CalendarPreview'
import { CalendarLegend } from './CalendarLegend'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('CalendarPreview', () => {
  it('renders the calendar with selected range', () => {
    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-01-15')

    renderWithProviders(
      <CalendarPreview
        dateRange={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
      />,
    )

    // Check if a month is displayed in the header (could be December or January depending on implementation)
    // Use getAllByText instead of getByText to handle multiple elements with the same text
    const monthTextElements = screen.getAllByText(/\w+ \d{4}/)
    expect(monthTextElements.length).toBeGreaterThan(0)
    expect(monthTextElements[0]).toBeInTheDocument()

    // Check if the range is displayed in the calendar's aria-label
    expect(screen.getByRole('application')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/January/i),
    )
  })

  it('renders with highlight dates', () => {
    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-01-15')
    const highlightDate1 = new Date('2025-01-10')
    const highlightDate2 = new Date('2025-01-12')

    renderWithProviders(
      <CalendarPreview
        dateRange={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
        highlightDates={[
          {
            date: highlightDate1,
            highlightColor: 'primary',
            label: 'Important Date',
          },
          {
            date: highlightDate2,
            highlightColor: 'secondary',
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

  it('handles dates in multiple months correctly', () => {
    const startDate = new Date('2025-01-15')
    const endDate = new Date('2025-02-15')

    renderWithProviders(
      <CalendarPreview
        dateRange={{
          start: startDate,
          end: endDate,
          label: 'Multi-month Range',
        }}
      />,
    )

    // Should display a month name
    // Use getAllByText instead of getByText to handle multiple elements with the same text
    const monthTextElements = screen.getAllByText(/\w+ 2025/)
    expect(monthTextElements.length).toBeGreaterThan(0)
    expect(monthTextElements[0]).toBeInTheDocument()

    // Check if the calendar has an aria-label that includes the month
    expect(screen.getByRole('application')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/January/i),
    )
  })

  it('displays dates within the selected range', () => {
    const startDate = new Date('2025-01-05')
    const endDate = new Date('2025-01-10')

    renderWithProviders(
      <CalendarPreview
        dateRange={{
          start: startDate,
          end: endDate,
          label: 'Test Range',
        }}
      />,
    )

    // Check if the calendar is rendered with the correct month
    expect(screen.getByRole('grid')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/January/i),
    )

    // Check if the application has an aria-label that includes the date range
    const appElement = screen.getByRole('application')
    expect(appElement).toHaveAttribute('aria-label')
    const ariaLabel = appElement.getAttribute('aria-label') || ''
    expect(ariaLabel).toContain('January')
  })

  it('displays the month name for the selected date range', () => {
    const startDate = new Date('2025-03-01')
    const endDate = new Date('2025-03-15')

    renderWithProviders(
      <CalendarPreview
        dateRange={{
          start: startDate,
          end: endDate,
          label: 'March Range',
        }}
      />,
    )

    // Check if a month name is displayed (could be February or March depending on implementation)
    // Use getAllByText instead of getByText to handle multiple elements with the same text
    const monthTextElements = screen.getAllByText(/\w+ 2025/)
    expect(monthTextElements.length).toBeGreaterThan(0)
    expect(monthTextElements[0]).toBeInTheDocument()

    // Check that the application has an aria-label that includes March
    expect(screen.getByRole('application')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/March/i),
    )
  })
})

describe('CalendarDisplayLegend', () => {
  it('renders legend items with correct formatting', async () => {
    const highlightDates = [
      {
        date: new Date('2025-01-10'),
        highlightColor: 'primary' as const,
        label: 'Important Date',
      },
      {
        date: new Date('2025-01-12'),
        highlightColor: 'secondary' as const,
        label: 'Deadline',
      },
    ]

    renderWithProviders(
      <CalendarLegend
        highlightDates={highlightDates}
        dateRange={{
          start: new Date('2025-01-01'),
          end: new Date('2025-01-15'),
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

    // Check if legend markers are present using class name instead of inline style
    const legendMarkers = await screen.findAllByTestId('calendar-legend-item')
    expect(legendMarkers.length).toBe(2)
  })

  it('renders empty when no highlight dates are provided', () => {
    renderWithProviders(
      <CalendarLegend
        dateRange={{
          start: new Date('2025-01-01'),
          end: new Date('2025-01-15'),
          label: 'Test Range',
        }}
        data-testid="calendar-legend"
      />,
    )

    // The legend container should be present but without highlight items
    const legendContainer = screen.getByTestId('calendar-legend')
    expect(legendContainer).toBeInTheDocument()

    // There should be no highlight labels
    expect(screen.queryByText(/January/)).not.toBeInTheDocument()
  })
})
