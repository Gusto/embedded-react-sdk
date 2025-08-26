import { beforeAll, beforeEach, describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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

    it('succeeds', { timeout: 60_000 }, async () => {
      const user = userEvent.setup()
      render(
        <GustoProvider config={{ baseUrl: API_BASE_URL }}>
          <OnboardingFlow companyId="123" onEvent={() => {}} />
        </GustoProvider>,
      )

      // Page - Add employee
      await screen.findByRole('button', { name: /Add/i }) // Wait for page to load

      await user.click(await screen.findByRole('button', { name: /Add/i }))

      // Page - Personal Details (Admin)
      await screen.findByLabelText(/social/i) // Wait for page to load

      await user.type(await screen.findByLabelText(/social/i), '456789012')
      await user.type(await screen.findByLabelText(/first name/i), 'john')
      await user.type(await screen.findByLabelText(/last name/i), 'silver')

      const emailField = screen.queryByLabelText(/email/i)
      if (emailField) {
        await user.type(emailField, 'someone@definitely-not-gusto.com')
      }

      // Work address (required for admin profile)
      const workAddressField = screen.queryByLabelText(/work address/i)
      if (workAddressField) {
        await user.click(workAddressField)
        await user.click(await screen.findByRole('option', { name: /123 Main St/i }))
      }

      // Dates
      const hasStartDate = screen.queryByLabelText('Start date')
      if (hasStartDate) {
        await fillDate({ date: { month: 1, day: 1, year: 2025 }, name: 'Start date', user })
      }
      await fillDate({ date: { month: 1, day: 1, year: 2000 }, name: 'Date of birth', user })

      // Home address
      await user.type(await screen.findByLabelText('Street 1'), '123 Any St')
      await user.type(await screen.findByLabelText(/city/i), 'Redmond')
      await user.click(await screen.findByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Washington' }))
      const zip = await screen.findByLabelText(/zip/i)
      await user.clear(zip)
      await user.type(zip, '98074')

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Compensation
      await screen.findByRole('button', { name: 'Continue' }) // Wait for the page to load

      await user.type(await screen.findByLabelText(/job title/i), 'cat herder')
      await user.click(await screen.findByLabelText('Employee type'))
      await user.click(await screen.findByRole('option', { name: 'Paid by the hour' }))
      await user.type(await screen.findByLabelText(/compensation amount/i), '100')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Compensation pt 2
      await screen.findByRole('button', { name: 'Continue' }) // Wait for the page to load
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - Federal Taxes (separate step)
      await screen.findByRole('heading', { name: /Federal tax withholdings/i })
      await user.click(await screen.findByLabelText(/Filing status/i))
      await user.click(await screen.findByRole('option', { name: 'Single' }))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page - State Taxes (separate step)
      const taxReqHeadings = await screen.findAllByText(/Tax Requirements/i)
      expect(taxReqHeadings.length).toBeGreaterThan(0)
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

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
