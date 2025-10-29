import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Suspense } from 'react'
import { FlowBreadcrumbs } from './FlowBreadcrumbs'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('FlowBreadcrumbs', () => {
  it('should render breadcrumb navigation with namespace and variables', async () => {
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
      <Suspense fallback={<div>Loading...</div>}>
        <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="configuration" />
      </Suspense>,
    )

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  it('should render breadcrumb label without namespace', () => {
    const breadcrumbs = [
      {
        id: 'landing',
        label: 'Simple Label',
      },
    ]
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <FlowBreadcrumbs breadcrumbs={breadcrumbs} currentBreadcrumbId="landing" />
      </Suspense>,
    )

    expect(screen.getByText('Simple Label')).toBeInTheDocument()
  })
})
