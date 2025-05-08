import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { EmployeeList } from './EmployeeList'
import { server } from '@/test/mocks/server'
import { handleGetCompanyEmployees } from '@/test/mocks/apis/employees'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

beforeEach(() => {
  mockResizeObserver()
})

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

  it('renders a list of employees', async () => {
    renderWithProviders(<EmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    await waitFor(async () => {
      await screen.findByText('Your employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })
})
