import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { WorkAddressEditForm } from './WorkAddressEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('WorkAddressEditForm', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
  })

  it('renders management copy and current work address from fixtures', async () => {
    renderWithProviders(<WorkAddressEditForm employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText(/2216 Icie Villages/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Work address' })).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <WorkAddressEditForm employeeId="employee-123" onEvent={onEvent} className="custom-class" />,
    )

    await waitFor(
      () => {
        expect(screen.getByText(/2216 Icie Villages/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
