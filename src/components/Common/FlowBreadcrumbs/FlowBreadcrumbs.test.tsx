import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { FlowBreadcrumbs } from './FlowBreadcrumbs'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('FlowBreadcrumbs date formatting', () => {
  it('should render without errors when breadcrumbs have date string variables', () => {
    const breadcrumbs = [
      {
        id: 'configuration',
        label: 'breadcrumbLabel',
        namespace: 'Payroll.PayrollConfiguration',
        variables: {
          startDate: '2023-12-25',
          endDate: '2024-01-05',
        },
      },
    ]

    renderWithProviders(
      <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="configuration" />,
    )

    expect(screen.getByText(/2023-12-25/)).toBeInTheDocument()
  })

  it('should render without errors when breadcrumbs have no date variables', () => {
    const breadcrumbs = [
      {
        id: 'landing',
        label: 'labels.breadcrumbLabel',
        namespace: 'Payroll.PayrollLanding',
      },
    ]

    renderWithProviders(<FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="landing" />)

    expect(screen.getByText(/labels\.breadcrumbLabel/)).toBeInTheDocument()
  })
})
