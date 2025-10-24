import { describe, it, expect } from 'vitest'
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

    const { container } = renderWithProviders(
      <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="configuration" />,
    )

    expect(container).toBeTruthy()
  })

  it('should render without errors when breadcrumbs have no date variables', () => {
    const breadcrumbs = [
      {
        id: 'landing',
        label: 'labels.breadcrumbLabel',
        namespace: 'Payroll.PayrollLanding',
      },
    ]

    const { container } = renderWithProviders(
      <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="landing" />,
    )

    expect(container).toBeTruthy()
  })

  it('should render without errors when date strings are invalid', () => {
    const breadcrumbs = [
      {
        id: 'configuration',
        label: 'breadcrumbLabel',
        namespace: 'Payroll.PayrollConfiguration',
        variables: {
          startDate: 'invalid-date',
          endDate: '2024-01-05',
        },
      },
    ]

    const { container } = renderWithProviders(
      <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="configuration" />,
    )

    expect(container).toBeTruthy()
  })

  it('should render without errors when date variables are not strings', () => {
    const breadcrumbs = [
      {
        id: 'configuration',
        label: 'breadcrumbLabel',
        namespace: 'Payroll.PayrollConfiguration',
        variables: {
          startDate: new Date('2023-12-25'),
          endDate: new Date('2024-01-05'),
        },
      },
    ]

    const { container } = renderWithProviders(
      <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="configuration" />,
    )

    expect(container).toBeTruthy()
  })
})
