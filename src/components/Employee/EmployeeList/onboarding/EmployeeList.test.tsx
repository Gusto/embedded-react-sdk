import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { EmployeeList } from './EmployeeList'
import { server } from '@/test/mocks/server'
import { handleGetCompanyEmployees } from '@/test/mocks/apis/employees'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EmployeeList', () => {
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

  it('shows the empty-state skip button by default', async () => {
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([], {
          headers: {
            'x-total-pages': '1',
            'x-total-count': '0',
          },
        }),
      ),
    )

    renderWithProviders(<EmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    expect(await screen.findByRole('button', { name: /do this later/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add an employee/i })).toBeInTheDocument()
  })

  it('hides the empty-state skip button when showSkipButton is false', async () => {
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([], {
          headers: {
            'x-total-pages': '1',
            'x-total-count': '0',
          },
        }),
      ),
    )

    renderWithProviders(
      <EmployeeList companyId="some-company-uuid" onEvent={() => {}} showSkipButton={false} />,
    )

    expect(await screen.findByRole('button', { name: /add an employee/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /do this later/i })).toBeNull()
  })

  it('renders a list of employees', async () => {
    renderWithProviders(<EmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    await waitFor(async () => {
      await screen.findByText('Your employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })
})
