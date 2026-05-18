import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddJob } from './AddJob'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('management/AddJob', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
  })

  it('renders an Add another job heading and Add job submit CTA', async () => {
    renderWithProviders(
      <AddJob employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    expect(await screen.findByRole('heading', { name: 'Add another job' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add job' })).toBeInTheDocument()
  })

  it('hides the hire date field (it is threaded in via the employee hireDate prop)', async () => {
    renderWithProviders(
      <AddJob employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })
    expect(screen.queryByLabelText(/hire date/i)).not.toBeInTheDocument()
  })

  it('exposes a visible effective date field for the new compensation', async () => {
    renderWithProviders(
      <AddJob employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })
    expect(screen.getByLabelText('Effective date')).toBeInTheDocument()
  })

  it('fires onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderWithProviders(
      <AddJob
        employeeId="employee-uuid"
        hireDate="2024-12-24"
        onCancel={onCancel}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
  })
})
