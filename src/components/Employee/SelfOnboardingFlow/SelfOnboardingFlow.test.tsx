import { beforeAll, beforeEach, describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { SelfOnboardingFlow } from './SelfOnboardingFlow'
import { server } from '@/test/mocks/server'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import { fillDate } from '@/test/reactAriaUserEvent'
import {
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

describe('EmployeeSelfOnboardingFlow', () => {
  beforeAll(() => {
    mockResizeObserver()
  })
  describe('simplest happy path case', () => {
    beforeEach(() => {
      server.use(
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
        <GustoProvider config={{ baseUrl: API_BASE_URL }}>
          <SelfOnboardingFlow companyId="123" employeeId="456" onEvent={() => {}} />
        </GustoProvider>,
      )

      // Page 1 - Get Started
      await screen.findByRole('button', { name: /started/i }) // Wait for page to load

      await user.click(await screen.findByRole('button', { name: /started/i }))

      // Page 2 - Personal Details
      await screen.findByLabelText(/social/i) // Wait for page to load

      await user.type(await screen.findByLabelText(/social/i), '456789012')
      await user.type(await screen.findByLabelText(/first name/i), 'john')
      await user.type(await screen.findByLabelText(/last name/i), 'silver')

      await fillDate({ date: { month: 1, day: 1, year: 2000 }, name: 'Date of birth', user })
      await user.type(await screen.findByLabelText('Street 1'), '123 Any St')
      await user.type(await screen.findByLabelText(/city/i), 'Redmond')
      await user.click(await screen.findByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Washington' }))
      const zip = await screen.findByLabelText(/zip/i)
      await user.clear(zip)
      await user.type(zip, '98074')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 3 - Federal / State Taxes
      await screen.findByLabelText(/Withholding Allowance/i) // Wait for page to load

      await user.type(await screen.findByLabelText(/Withholding Allowance/i), '3')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 4 - Payment method
      await screen.findByText('Check') // Wait for page to load

      await user.click(await screen.findByText('Check'))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 5 - Sign documents
      await screen.findByRole('button', { name: 'Continue' }) // Wait for page to load

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 6 - Completed
      await screen.findByText("You've completed setup!")
    }, 10000)
  })
})
