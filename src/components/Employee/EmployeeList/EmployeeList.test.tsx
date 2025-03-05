import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { EmployeeList } from './EmployeeList'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetCompanyEmployees } from '@/test/mocks/apis/employees'

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
    render(
      <GustoTestApiProvider>
        <EmployeeList companyId="some-company-uuid" onEvent={() => {}} />
      </GustoTestApiProvider>,
    )

    await waitFor(async () => {
      await screen.findByText('Your employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })
})
