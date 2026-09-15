import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { DeductionsEditForm } from './DeductionsEditForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('management/DeductionsEditForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <DeductionsEditForm employeeId="employee-123" onEvent={vi.fn()} className="custom-class" />,
    )

    await screen.findByRole('heading', { name: 'Add Deduction' })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
