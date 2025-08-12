import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StateTaxes } from './StateTaxes'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import { server } from '@/test/mocks/server'
import {
  getEmployeeStateTaxes,
  updateEmployeeStateTaxes,
} from '@/test/mocks/apis/employee_state_taxes'

describe('StateTaxes', () => {
  it('renders without crashing', async () => {
    server.use(getEmployeeStateTaxes, updateEmployeeStateTaxes)

    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <StateTaxes employeeId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('California Tax Requirements')).toBeInTheDocument()
    })
  })
})
