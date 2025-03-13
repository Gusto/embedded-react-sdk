import { beforeAll, beforeEach, describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { EmployeeSelfOnboardingFlow } from './EmployeeSelfOnboardingFlow'
import { server } from '@/test/mocks/server'
import { GustoApiProvider } from '@/contexts'
import { API_BASE_URL } from '@/api/constants'
import { fillDate, fillSelect } from '@/test/reactAriaUserEvent'
import { getEmployee, updateEmployee } from '@/test/mocks/apis/employees'
import { getCompany } from '@/test/mocks/apis/company'
import { getCompanyLocations } from '@/test/mocks/apis/company_locations'
import { getEmployeeWorkAddresses } from '@/test/mocks/apis/workAddresses'
import {
  createEmployeeHomeAddress,
  getEmptyEmployeeHomeAddresses,
} from '@/test/mocks/apis/homeAddresses'
import {
  getEmptyCompanyFederalTaxes,
  updateEmptyCompanyFederalTaxes,
} from '@/test/mocks/apis/company_federal_taxes'
import {
  getEmptyCompanyStateTaxes,
  updateEmptyCompanyStateTaxes,
} from '@/test/mocks/apis/company_state_taxes'
import {
  getEmptyEmployeeBankAccounts,
  getEmptyEmployeePaymentMethod,
  updateEmptyEmployeePaymentMethod,
} from '@/test/mocks/apis/employeesBankAccounts'
import { getEmptyEmployeeForms } from '@/test/mocks/apis/company_forms'
import { getEmptyOnboardingStatus } from '@/test/mocks/apis/onboarding_status'

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
        getEmptyEmployeeHomeAddresses,
        updateEmployee,
        createEmployeeHomeAddress,
        getEmptyCompanyFederalTaxes,
        getEmptyCompanyStateTaxes,
        updateEmptyCompanyFederalTaxes,
        updateEmptyCompanyStateTaxes,
        getEmptyEmployeePaymentMethod,
        getEmptyEmployeeBankAccounts,
        updateEmptyEmployeePaymentMethod,
        getEmptyEmployeeForms,
        getEmptyOnboardingStatus,
      )
    })

    it('succeeds', async () => {
      const user = userEvent.setup()
      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <EmployeeSelfOnboardingFlow companyId="123" employeeId="456" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      // Page 1 - Get Started
      await user.click(await screen.findByRole('button', { name: /started/i }))

      // Page 2 - Personal Details
      await user.type(await screen.findByLabelText(/social/i), '456789012')

      await fillDate({ date: { month: 1, day: 1, year: 2000 }, name: 'Date of birth', user })
      await user.type(await screen.findByLabelText('Street 1'), '123 Any St')
      await user.type(await screen.findByLabelText(/city/i), 'Redmond')
      await user.click(await screen.findByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Washington' }))
      await user.type(await screen.findByLabelText(/zip/i), '98074')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 3 - Federal / State Taxes
      await fillSelect({ optionNames: [/single/i], selectName: /Select filing status/i, user })
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
