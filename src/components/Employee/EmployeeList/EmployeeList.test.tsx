import { beforeEach, describe, expect, it } from 'vitest'
import { EmployeeList } from './EmployeeList'
import { render, screen } from '@testing-library/react'
import { GustoApiProvider } from '@/contexts'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('EmployeeList', () => {
  beforeEach(() => {
    server.use(
      http.get('http://mock.gusto.dev/v1/companies/some-company-uuid/employees', () =>
        HttpResponse.json([
          {
            uuid: 'some-unique-id',
            first_name: 'Sean',
            last_name: 'Test',
          },
        ]),
      ),
    )
  })
  it('renders a list of employees', async () => {
    render(
      <GustoApiProvider config={{ baseUrl: 'http://mock.gusto.dev' }}>
        <EmployeeList companyId="some-company-uuid" onEvent={() => {}} />
      </GustoApiProvider>,
    )

    await screen.findByText('Your employees')

    expect(screen.queryAllByRole('row')[1]).toHaveTextContent('Test, Sean')
  })
})
