import { describe, expect, it } from 'vitest'
import { EmployeeList } from './EmployeeList'
import { render, screen } from '@testing-library/react'
import { GustoApiProvider } from '@/contexts'

describe('EmployeeList', () => {
  it('renders a list of employees', async () => {
    render(
      <GustoApiProvider>
        <EmployeeList companyId="some-company-uuid" onEvent={() => {}} />
      </GustoApiProvider>,
    )

    await screen.findByText('Your employees')

    expect(screen.queryAllByRole('row')[1]).toHaveTextContent('Steel, Maximus')
  })
})
