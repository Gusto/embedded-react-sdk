import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { FlowBreadcrumbs } from './FlowBreadcrumbs'
import type { FlowBreadcrumb } from './FlowBreadcrumbsTypes'
import { componentEvents } from '@/shared/constants'
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

  it('should not fire event for breadcrumbs without onNavigate', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    const navigateFn = vi.fn()
    const breadcrumbs: FlowBreadcrumb[] = [
      { id: 'step-one', label: 'Step One', onNavigate: navigateFn },
      { id: 'step-two', label: 'Step Two' },
      { id: 'step-three', label: 'Step Three' },
    ]
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <FlowBreadcrumbs
          breadcrumbs={breadcrumbs}
          currentBreadcrumbId="step-three"
          onEvent={onEvent}
        />
      </Suspense>,
    )

    const stepTwoText = screen.getByText('Step Two')
    await user.click(stepTwoText)
    expect(onEvent).not.toHaveBeenCalled()

    const stepOneButton = screen.getByRole('button', { name: 'Step One' })
    await user.click(stepOneButton)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.BREADCRUMB_NAVIGATE, {
      key: 'step-one',
      onNavigate: navigateFn,
    })
  })

  it('should render breadcrumb with isNavigable false as non-clickable', () => {
    const onEvent = vi.fn()
    const breadcrumbs: FlowBreadcrumb[] = [
      { id: 'step-one', label: 'Step One', onNavigate: vi.fn() },
      { id: 'step-two', label: 'Step Two', onNavigate: vi.fn(), isNavigable: false },
      { id: 'step-three', label: 'Step Three' },
    ]
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <FlowBreadcrumbs
          breadcrumbs={breadcrumbs}
          currentBreadcrumbId="step-three"
          onEvent={onEvent}
        />
      </Suspense>,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent('Step One')
  })
})
