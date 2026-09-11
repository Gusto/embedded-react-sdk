import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { EmployeeDocuments } from './EmployeeDocuments'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EmployeeDocuments', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <EmployeeDocuments employeeId="employee-123" onEvent={vi.fn()} className="custom-class" />,
    )

    await screen.findByRole('heading', { name: 'Employee documents' })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
