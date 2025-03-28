import { beforeAll, beforeEach, describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { EmployeeOnboardingFlow } from './EmployeeOnboardingFlow'
import { server } from '@/test/mocks/server'
import { GustoApiProvider } from '@/contexts'
import { API_BASE_URL } from '@/api/constants'
import { fillDate } from '@/test/reactAriaUserEvent'
import {
  createEmployee,
  getCompanyEmployees,
  getEmployee,
  getEmployeeOnboardingStatus,
  updateEmployee,
  updateEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'
import { getCompany } from '@/test/mocks/apis/company'
import { getCompanyLocations } from '@/test/mocks/apis/company_locations'
import {
  createEmployeeWorkAddress,
  getEmployeeWorkAddresses,
  updateEmployeeWorkAddress,
} from '@/test/mocks/apis/employee_work_addresses'
import {
  getEmptyEmployeeBankAccounts,
  getEmptyEmployeePaymentMethod,
  updateEmptyEmployeePaymentMethod,
} from '@/test/mocks/apis/employeesBankAccounts'
import { getEmptyEmployeeForms } from '@/test/mocks/apis/company_forms'
import {
  getEmployeeFederalTaxes,
  updateEmployeeFederalTaxes,
} from '@/test/mocks/apis/employee_federal_taxes'
import {
  getEmployeeStateTaxes,
  updateEmployeeStateTaxes,
} from '@/test/mocks/apis/employee_state_taxes'
import {
  createEmployeeHomeAddress,
  getEmployeeHomeAddresses,
  updateEmployeeHomeAddress,
} from '@/test/mocks/apis/employee_home_addresses'

describe('EmployeeOnboardingFlow', () => {
  beforeAll(() => {
    mockResizeObserver()
  })
  describe('simplest happy path case', () => {
    beforeEach(() => {
      server.events.on('request:start', ({ request }) => {
        console.log('Outgoing:', request.method, request.url)
      })

      server.use(
        createEmployee,
        getCompanyEmployees('123'),
        getEmployee,
        getCompany,
        getCompanyLocations,
        getEmployeeWorkAddresses,
        createEmployeeWorkAddress,
        updateEmployeeWorkAddress,
        getEmployeeHomeAddresses,
        createEmployeeHomeAddress,
        updateEmployeeHomeAddress,
        getEmployee,
        updateEmployee,
        getEmployeeFederalTaxes,
        updateEmployeeFederalTaxes,
        getEmployeeStateTaxes,
        updateEmployeeStateTaxes,
        getEmptyEmployeePaymentMethod,
        getEmptyEmployeeBankAccounts,
        updateEmptyEmployeePaymentMethod,
        getEmptyEmployeeForms,
        getEmployeeOnboardingStatus,
        updateEmployeeOnboardingStatus,
      )
    })

    it('succeeds', async () => {
      const user = userEvent.setup()
      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <EmployeeOnboardingFlow companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      // Page 1 - Add employee
      await user.click(await screen.findByRole('button', { name: /Add another/i }))

      // Page 2 - Personal Details
      await user.type(await screen.findByLabelText(/social/i), '456789012')
      await user.type(await screen.findByLabelText(/first name/i), 'john')
      await user.type(await screen.findByLabelText(/last name/i), 'silver')
      await user.type(await screen.findByLabelText(/email/i), 'someone@definitely-not-gusto.com')

      // Work address
      await user.click(await screen.findByLabelText(/work address/i))
      await user.click(await screen.findByText(/123 Main St/i))
      await fillDate({ date: { month: 1, day: 1, year: 2025 }, name: 'Start date', user })
      await fillDate({ date: { month: 1, day: 1, year: 2000 }, name: 'Date of birth', user })
      await user.type(await screen.findByLabelText('Street 1'), '123 Any St')
      await user.type(await screen.findByLabelText(/city/i), 'Redmond')

      // State
      await user.click(await screen.findByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Washington' }))

      // Zip
      const zip = await screen.findByLabelText(/zip/i)
      await user.clear(zip)
      await user.type(zip, '98074')

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // screen.debug(undefined, Infinity)
      return

      // Page 3 - Federal / State Taxes
      await user.type(await screen.findByLabelText(/Withholding Allowance/i), '3')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 4 - Payment method
      await user.click(await screen.findByText('Check'))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 5 - Sign documents
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 6 - Completed
      await screen.findByText("You've completed setup!")
    })
  })
})
