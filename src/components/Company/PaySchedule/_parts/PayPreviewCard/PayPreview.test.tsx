import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PayPreviewCard } from './PayPreviewCard'

describe('PayPreviewCard', () => {
  it('renders pay period dates correctly', () => {
    const startDate = '2023-01-01'
    const endDate = '2023-01-15'
    const checkdate = '2023-01-20'
    const runPayrollBy = '2023-01-19'

    render(
      <PayPreviewCard
        checkdate={checkdate}
        endDate={endDate}
        startDate={startDate}
        runPayrollBy={runPayrollBy}
      />,
    )

    expect(screen.getByText('payPreview.payPeriod')).toBeInTheDocument()
    expect(screen.getByText(`${startDate} - ${endDate}`)).toBeInTheDocument()
  })

  it('renders payday information correctly', () => {
    const checkdate = '2023-01-20'

    render(
      <PayPreviewCard
        checkdate={checkdate}
        endDate="2023-01-15"
        startDate="2023-01-01"
        runPayrollBy="2023-01-19"
      />,
    )

    expect(screen.getByText('payPreview.payday')).toBeInTheDocument()
    expect(screen.getByText(checkdate)).toBeInTheDocument()
  })

  it('renders payroll deadline correctly', () => {
    const runPayrollBy = '2023-01-19'

    render(
      <PayPreviewCard
        checkdate="2023-01-20"
        endDate="2023-01-15"
        startDate="2023-01-01"
        runPayrollBy={runPayrollBy}
      />,
    )

    expect(screen.getByText('payPreview.payrollDeadline')).toBeInTheDocument()
    expect(screen.getByText(runPayrollBy)).toBeInTheDocument()
  })

  it('maintains consistent layout with all dates', () => {
    const dates = {
      startDate: '2023-01-01',
      endDate: '2023-01-15',
      checkdate: '2023-01-20',
      runPayrollBy: '2023-01-19',
    }

    const { container } = render(
      <PayPreviewCard
        checkdate={dates.checkdate}
        endDate={dates.endDate}
        startDate={dates.startDate}
        runPayrollBy={dates.runPayrollBy}
      />,
    )

    // Check for dividers between sections
    const dividers = container.getElementsByTagName('hr')
    expect(dividers).toHaveLength(2)

    // Check for all sections present
    expect(screen.getByText('payPreview.payPeriod')).toBeInTheDocument()
    expect(screen.getByText('payPreview.payday')).toBeInTheDocument()
    expect(screen.getByText('payPreview.payrollDeadline')).toBeInTheDocument()
  })
})
