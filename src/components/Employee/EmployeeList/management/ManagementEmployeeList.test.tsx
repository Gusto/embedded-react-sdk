import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { ManagementEmployeeList } from './ManagementEmployeeList'
import { server } from '@/test/mocks/server'
import { handleGetCompanyEmployees } from '@/test/mocks/apis/employees'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ManagementEmployeeList', () => {
  beforeEach(() => {
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([
          {
            uuid: 'some-unique-id',
            first_name: 'Sean',
            last_name: 'Test',
            payment_method: 'Direct Deposit',
          },
        ]),
      ),
    )
  })

  it('renders a list of employees', async () => {
    renderWithProviders(<ManagementEmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    await waitFor(async () => {
      await screen.findByText('Employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <ManagementEmployeeList
        companyId="some-company-uuid"
        onEvent={vi.fn()}
        className="custom-class"
      />,
    )

    await screen.findByText('Sean Test')

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
