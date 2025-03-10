import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PayPreviewCard } from './PayPreviewCard'

describe('PayPreviewCard', () => {
  it('renders the correct headings and dates', () => {
    // Format dates as YYYY-MM-DD for the component
    const startDateStr = '2023-01-01'
    const endDateStr = '2023-01-15'
    const checkdateStr = '2023-01-20'
    const runPayrollByStr = '2023-01-19'

    render(
      <PayPreviewCard
        checkdate={checkdateStr}
        endDate={endDateStr}
        startDate={startDateStr}
        runPayrollBy={runPayrollByStr}
        payPreviewSelector={<div data-testid="pay-preview-selector">Pay Preview Selector</div>}
      />,
    )

    // Check for the calendar grid with the correct month
    expect(screen.getByRole('grid', { name: 'January 2023' })).toBeInTheDocument()

    // Check for the pay preview selector
    expect(screen.getByTestId('pay-preview-selector')).toBeInTheDocument()

    // Check for the calendar application with the correct date range
    expect(screen.getByRole('application', { name: /January 1 to/i })).toBeInTheDocument()
  })
})
