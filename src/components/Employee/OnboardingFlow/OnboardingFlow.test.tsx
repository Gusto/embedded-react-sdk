import { beforeAll, beforeEach, describe, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { OnboardingFlow } from './OnboardingFlow'
import { server } from '@/test/mocks/server'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import { fillDate } from '@/test/reactAriaUserEvent'
import {
  createEmployee,
  getCompanyEmployees,
  getEmployee,
  getEmployeeGarnishments,
  getEmployeeJobs,
  getEmployeeOnboardingStatus,
  updateEmployee,
  updateEmployeeCompensation,
  updateEmployeeJob,
  updateEmployeeOnboardingStatus,
  createEmployeeJob,
  deleteEmployeeJob,
} from '@/test/mocks/apis/employees'
import { getCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { getCompany } from '@/test/mocks/apis/company'
import { getCompanyLocations, getMinimumWages } from '@/test/mocks/apis/company_locations'
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
        getEmployeeJobs,
        getMinimumWages,
        getEmployee,
        updateEmployee,
        updateEmployeeJob,
        getEmployeeFederalTaxes,
        updateEmployeeFederalTaxes,
        getEmployeeStateTaxes,
        updateEmployeeStateTaxes,
        getEmptyEmployeePaymentMethod,
        getEmptyEmployeeBankAccounts,
        updateEmptyEmployeePaymentMethod,
        getEmployeeGarnishments,
        updateEmployeeCompensation,
        getEmptyEmployeeForms,
        getEmployeeOnboardingStatus,
        updateEmployeeOnboardingStatus,
        createEmployeeJob,
        deleteEmployeeJob,
        getCompanyFederalTaxes,
      )
    })

    it('succeeds', { timeout: 20_000 }, async () => {
      const user = userEvent.setup()
      render(
        <GustoProvider config={{ baseUrl: API_BASE_URL }}>
          <OnboardingFlow companyId="123" onEvent={() => {}} />
        </GustoProvider>,
      )

      // Page - Add employee
      await screen.findByRole('button', { name: /Add/i }) // Wait for page to load

      await user.click(await screen.findByRole('button', { name: /Add/i }))

      // Page - Personal Details
      await screen.findByLabelText(/social/i) // Wait for page to load

      await user.type(await screen.findByLabelText(/social/i), '456789012')
      await user.type(await screen.findByLabelText(/first name/i), 'john')
      await user.type(await screen.findByLabelText(/last name/i), 'silver')
      await user.type(await screen.findByLabelText(/email/i), 'someone@definitely-not-gusto.com')

      // Work address
      await user.click(await screen.findByLabelText(/work address/i))
      await user.click(await screen.findByRole('option', { name: /123 Main St/i }))
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

      // Page - Compensation
      // Wait for compensation page to fully load - look for multiple form elements to ensure it's not just a skeleton
      await waitFor(
        async () => {
          await screen.findByLabelText(/job title/i)
          await screen.findByLabelText('Employee type')
          await screen.findByLabelText(/compensation amount/i)
        },
        { timeout: 15000 },
      )

      await user.type(await screen.findByLabelText(/job title/i), 'cat herder')
      await user.click(await screen.findByLabelText('Employee type'))
      await user.click(await screen.findByRole('option', { name: 'Paid by the hour' }))
      await user.type(await screen.findByLabelText(/compensation amount/i), '100')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Compensation pt 2
      await screen.findByRole('button', { name: 'Continue' }) // Wait for the page to load

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Federal / State Taxes
      await screen.findByLabelText(/dependents/i) // Wait for page to load

      // Fill in required federal tax fields
      await user.click(await screen.findByLabelText(/no/i)) // Select "No" for two jobs
      await user.type(await screen.findByLabelText(/dependents/i), '3')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - State Taxes (California)
      await screen.findByText('California Tax Requirements') // Wait for state taxes page
      await user.click(await screen.findByRole('button', { name: 'Continue' })) // Submit state taxes

      // Page - Payment method
      await screen.findByText('Check') // Wait for page to load

      await user.click(await screen.findByText('Check'))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Deductions
      await screen.findByLabelText('No') // Wait for page to load

      await user.click(await screen.findByLabelText('No'))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Completed
      await screen.findByText(/that's it/i)
    })
  })
})
