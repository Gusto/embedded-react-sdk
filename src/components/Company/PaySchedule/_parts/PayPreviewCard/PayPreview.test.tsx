import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PayPreviewCard } from './PayPreviewCard'

describe('PayPreviewCard', () => {
  it('renders the correct headings and dates', () => {
    const startDate = new Date(2023, 0, 1)
    const endDate = new Date(2023, 0, 15)
    const checkdate = new Date(2023, 0, 20)
    const runPayrollBy = new Date(2023, 0, 19)

    render(
      <PayPreviewCard
        checkdate={checkdate}
        endDate={endDate}
        startDate={startDate}
        runPayrollBy={runPayrollBy}
      />,
    )

    expect(
      screen.getByText(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`),
    ).toBeInTheDocument()
    expect(screen.getByText(checkdate.toLocaleDateString())).toBeInTheDocument()
    expect(screen.getByText(runPayrollBy.toLocaleDateString())).toBeInTheDocument()
  })
})
