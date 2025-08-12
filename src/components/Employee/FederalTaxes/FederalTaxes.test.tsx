import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FederalTaxes } from './FederalTaxes'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import { server } from '@/test/mocks/server'
import {
  getEmployeeFederalTaxes,
  updateEmployeeFederalTaxes,
} from '@/test/mocks/apis/employee_federal_taxes'

describe('FederalTaxes', () => {
  it('renders without crashing', async () => {
    server.use(getEmployeeFederalTaxes, updateEmployeeFederalTaxes)

    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <FederalTaxes employeeId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Federal tax withholdings (Form W-4)')).toBeInTheDocument()
    })
  })
})
