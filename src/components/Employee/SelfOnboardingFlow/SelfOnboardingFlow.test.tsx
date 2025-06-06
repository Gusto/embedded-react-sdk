import { beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
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

// Helper function to run axe on the document
const runAxe = async (): Promise<AxeResults> => {
  return await run(document.body, {
    rules: {
      'color-contrast': { enabled: false },
      // For integration tests, we may need to be more lenient with certain rules
      // that are more relevant to complete pages rather than individual components
      'page-has-heading-one': { enabled: false }, // May not have h1 in component flows
      region: { enabled: false }, // Flows may not have proper landmark regions
      'heading-order': { enabled: false }, // Embedded flows don't control page heading hierarchy
      'aria-required-children': { enabled: false }, // Complex component structures in test environment
    },
  })
}

// Helper function to check accessibility and expect no violations
const expectNoA11yViolations = async (stepName: string) => {
  const results = await runAxe()

  // Log violations for debugging if any are found
  if (results.violations.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Accessibility violations in ${stepName}:`,
      results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })),
    )
  }

  expect(results.violations).toHaveLength(0)
}

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
      await expectNoA11yViolations('Get Started page')

      await user.click(await screen.findByRole('button', { name: /started/i }))

      // Page 2 - Personal Details
      await screen.findByLabelText(/social/i) // Wait for page to load
      await expectNoA11yViolations('Personal Details page')

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
      await expectNoA11yViolations('Federal/State Taxes page')

      await user.type(await screen.findByLabelText(/Withholding Allowance/i), '3')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 4 - Payment method
      await screen.findByText('Check') // Wait for page to load
      await expectNoA11yViolations('Payment Method page')

      await user.click(await screen.findByText('Check'))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 5 - Sign documents
      await screen.findByRole('button', { name: 'Continue' }) // Wait for page to load
      await expectNoA11yViolations('Sign Documents page')

      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 6 - Completed
      await screen.findByText("You've completed setup!")
      await expectNoA11yViolations('Completion page')
    }, 10000)
  })
})
