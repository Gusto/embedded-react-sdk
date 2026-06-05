import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Compensation } from './Compensation'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import {
  handleGetEmployeeJobs,
  handleCreateEmployeeJob,
  handleUpdateEmployeeJob,
  handleUpdateEmployeeCompensation,
  handleDeleteEmployeeJob,
} from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'
import { mockUseContainerBreakpoints } from '@/test/setup'

describe('Compensation', () => {
  beforeEach(() => {
    mockUseContainerBreakpoints.mockReturnValue(['base'])
    setupApiTestMocks()
    server.use(getMinimumWages)
  })

  describe('when employee has no saved jobs', () => {
    beforeEach(() => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
    })

    it('it initially renders compensation form with default values', async () => {
      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByRole('heading', { name: 'Compensation' })

      const jobTitleInput = screen.getByLabelText('Job Title')
      expect(jobTitleInput).toBeInTheDocument()
      expect(jobTitleInput).toHaveValue('')

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      expect(employmentTypeControl).toBeInTheDocument()

      const compensationAmountInput = screen.getByLabelText('Wage')
      expect(compensationAmountInput).toBeInTheDocument()
      expect(compensationAmountInput).toHaveValue('0.00')

      const payPeriodControl = screen.getByRole('button', {
        name: /Hour/i,
        expanded: false,
      })
      expect(payPeriodControl).toBeInTheDocument()
    })

    it('renders wage frequency options using the shared paymentUnit copy', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByRole('heading', { name: 'Compensation' })

      const payPeriodControl = screen.getByRole('button', {
        name: 'Hour Wage frequency',
        expanded: false,
      })
      await user.click(payPeriodControl)

      const listbox = await screen.findByRole('listbox')
      expect(within(listbox).getByRole('option', { name: 'Hour' })).toBeInTheDocument()
      expect(within(listbox).getByRole('option', { name: 'Week' })).toBeInTheDocument()
      expect(within(listbox).getByRole('option', { name: 'Month' })).toBeInTheDocument()
      expect(within(listbox).getByRole('option', { name: 'Year' })).toBeInTheDocument()
      expect(within(listbox).getByRole('option', { name: 'Paycheck' })).toBeInTheDocument()
    })

    it('navigates to jobs list if form is filled out with hourly employment type', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByRole('heading', { name: 'Compensation' })

      const jobTitleInput = screen.getByLabelText('Job Title')
      await user.type(jobTitleInput, 'My Job')

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const hourlyOption = screen.getByRole('option', {
        name: 'Paid by the hour',
      })
      await user.click(hourlyOption)

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '50000')
      await user.tab()

      const continueButtons = screen.getAllByRole('button', {
        name: 'Continue',
      })
      const continueButton = continueButtons[0]!
      await user.click(continueButton)

      expect(await screen.findByTestId('data-view')).toBeInTheDocument()
    })

    it('navigates to next step if form is filled out with non hourly employment type', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={onEvent} />,
      )

      await screen.findByRole('heading', { name: 'Compensation' })

      const jobTitleInput = screen.getByLabelText('Job Title')
      await user.type(jobTitleInput, 'My Job')

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Salary\/No overtime/i,
      })
      await user.click(exemptOption)

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '60000')
      await user.tab()

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_DONE, undefined)
      })
    })
  })

  describe('when employee a single job saved with nonexempt flsa status', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              version: 'job-version-123',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  version: 'compensation-version-123',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  title: 'My Job',
                  effective_date: '2024-12-24',
                  rate: '100.00',
                },
              ],
              rate: '100.00',
              hire_date: '2024-12-24',
            },
          ]),
        ),
      )
    })

    it('should initially display the jobs list with the job and compensation', async () => {
      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      expect(screen.getByText('My Job')).toBeInTheDocument()
      expect(screen.getByText('Paid by the hour')).toBeInTheDocument()
      expect(screen.getByText('100.00')).toBeInTheDocument()
      expect(screen.getByText('Hour')).toBeInTheDocument()
    })

    it('should allow for adding a new job', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByText('Job title')

      const addAnotherJobButton = screen.getByRole('button', {
        name: /Add another job/i,
      })
      await user.click(addAnotherJobButton)

      await screen.findByRole('heading', { name: 'Add job' })

      const jobTitleInput = screen.getByLabelText('Job Title')
      await user.type(jobTitleInput, 'My Job')

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '50')
      await user.tab()

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      expect(await screen.findByText('Job title')).toBeInTheDocument()
    })

    it('should allow user to edit the job and set flsa status to value other than nonexempt with no warning', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByText('Job title')

      const jobActionsControl = screen.getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const editButton = screen.getByRole('menuitem', {
        name: 'Edit',
      })

      await user.click(editButton)

      await screen.findByRole('heading', { name: 'Edit job' })

      const employmentTypeControl = screen.getByRole('button', {
        name: /Paid by the hour/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Salary\/No overtime/i,
      })
      await user.click(exemptOption)

      expect(
        screen.queryByText(
          "Changing this employee's classification will immediately delete their additional jobs.",
        ),
      ).not.toBeInTheDocument()

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      expect(await screen.findByText('Job title')).toBeInTheDocument()
    })
  })

  describe('when employee has a single job saved with flsa status that is not nonexempt', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              version: 'job-version-456',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  version: 'compensation-version-456',
                  payment_unit: 'Year',
                  flsa_status: 'Exempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  title: 'My Job',
                  effective_date: '2024-12-24',
                  rate: '100000.00',
                },
              ],
              rate: '100000.00',
              hire_date: '2024-12-24',
            },
          ]),
        ),
      )
    })

    it('should initially display the form with the correct fields filled out', async () => {
      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const jobTitleInput = screen.getByLabelText('Job Title')
      expect(jobTitleInput).toBeInTheDocument()
      expect(jobTitleInput).toHaveValue('My Job')

      const employmentTypeControl = screen.getByRole('button', {
        name: /Salary\/No overtime/i,
        expanded: false,
      })
      expect(employmentTypeControl).toBeInTheDocument()

      const compensationAmountInput = screen.getByLabelText('Wage')
      expect(compensationAmountInput).toBeInTheDocument()
      expect(compensationAmountInput).toHaveValue('100,000.00')

      const payPeriodControl = screen.getByRole('button', {
        name: /Year/i,
        expanded: false,
      })
      expect(payPeriodControl).toBeInTheDocument()
    })

    it('should navigate to the next step if the form is filled out with a non hourly employment type', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_DONE, undefined)
      })
    })

    it('should navigate to the jobs list if the employment type is changed to hourly', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const employmentTypeControl = screen.getByRole('button', {
        name: /Salary\/No overtime/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const hourlyOption = screen.getByRole('option', {
        name: 'Paid by the hour',
      })
      await user.click(hourlyOption)

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })
  })

  describe('when employee has multiple jobs saved', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              version: 'job-version-789',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  version: 'compensation-version-789',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  title: 'My Job',
                  effective_date: '2024-12-24',
                  rate: '100.00',
                },
              ],
              rate: '100.00',
              hire_date: '2024-12-24',
            },
            {
              uuid: 'job-uuid-2',
              version: 'job-version-790',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid-2',
              payment_unit: 'Hour',
              primary: false,
              two_percent_shareholder: false,
              title: 'An additional job',
              compensations: [
                {
                  uuid: 'compensation-uuid-2',
                  version: 'compensation-version-790',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid-2',
                  title: 'An additional job',
                  effective_date: '2024-12-24',
                  rate: '250.00',
                },
              ],
              rate: '250.00',
              hire_date: '2024-12-24',
            },
          ]),
        ),
      )
    })

    it('should display the jobs list with all jobs listed', async () => {
      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      expect(screen.getByText('My Job')).toBeInTheDocument()
      expect(screen.getByText('An additional job')).toBeInTheDocument()
    })

    it('fires EMPLOYEE_COMPENSATION_DONE when Continue is clicked from the jobs list', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_DONE, undefined)
      })
    })

    it('should not show delete option for the primary job', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')

      expect(cards).toHaveLength(2)

      const primaryJobCard = cards.find(
        card => card.textContent && card.textContent.includes('My Job'),
      )
      expect(primaryJobCard).toBeDefined()

      const jobActionsControl = within(primaryJobCard!).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const editButton = screen.queryByRole('menuitem', {
        name: 'Edit',
      })
      expect(editButton).toBeInTheDocument()

      const deleteButton = screen.queryByRole('menuitem', {
        name: 'Delete',
      })
      expect(deleteButton).not.toBeInTheDocument()
    })

    it('should allow for deleting non primary jobs', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')
      expect(cards).toHaveLength(2)

      const nonPrimaryJobCard = cards.find(
        card => card.textContent && card.textContent.includes('An additional job'),
      )
      expect(nonPrimaryJobCard).toBeDefined()

      const jobActionsControl = within(nonPrimaryJobCard!).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const deleteButton = screen.getByRole('menuitem', { name: 'Delete' })
      expect(deleteButton).toBeInTheDocument()

      await user.click(deleteButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_DELETED, undefined)
      })
    })

    it('should not display employee type field when editing a non primary job', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')
      expect(cards).toHaveLength(2)

      const nonPrimaryJobCard = cards.find(
        card => card.textContent && card.textContent.includes('An additional job'),
      )
      expect(nonPrimaryJobCard).toBeDefined()

      const jobActionsControl = within(nonPrimaryJobCard!).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const editButton = screen.getByRole('menuitem', {
        name: 'Edit',
      })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit job')).toBeInTheDocument()
      })

      expect(screen.queryByText('Employee type')).not.toBeInTheDocument()
    })

    it('should display employee type field when editing primary job and should warn if changing to other than nonexempt', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')
      expect(cards).toHaveLength(2)

      const primaryJobCard = cards.find(
        card => card.textContent && card.textContent.includes('My Job'),
      )
      expect(primaryJobCard).toBeDefined()

      const jobActionsControl = within(primaryJobCard!).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const editButton = screen.getByRole('menuitem', {
        name: 'Edit',
      })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit job')).toBeInTheDocument()
      })

      expect(screen.getByText('Employee type')).toBeInTheDocument()

      const employmentTypeControl = screen.getByRole('button', {
        name: /Paid by the hour/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Salary\/No overtime/i,
      })
      await user.click(exemptOption)

      expect(
        screen.getByText(
          "Changing this employee's classification will immediately delete their additional jobs.",
        ),
      ).toBeInTheDocument()

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })
    })

    it('should return to the jobs list if editing and cancel is selected', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')
      expect(cards).toHaveLength(2)

      const nonPrimaryJobCard = cards.find(
        card => card.textContent && card.textContent.includes('An additional job'),
      )
      expect(nonPrimaryJobCard).toBeDefined()

      const jobActionsControl = within(nonPrimaryJobCard!).getByRole('button', {
        name: 'Job actions',
      })
      await user.click(jobActionsControl)

      const editButton = screen.getByRole('menuitem', {
        name: 'Edit',
      })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit job')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel',
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })
    })
  })

  describe('Two Percent Shareholder field', () => {
    beforeEach(() => {
      setupApiTestMocks()
      server.use(getMinimumWages)
    })

    it('shows the checkbox when company has taxableAsScorp true and FLSA is Owner', async () => {
      server.use(
        handleGetCompanyFederalTaxes(() =>
          HttpResponse.json({
            version: '36d35e28689e641e9e153f0324c2625a',
            tax_payer_type: 'C-Corporation',
            taxable_as_scorp: true,
            filing_form: '944',
            has_ein: true,
            ein_verified: false,
            legal_name: 'foobarbaz',
          }),
        ),
      )
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              version: 'job-version-scorp',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Paycheck',
              primary: true,
              two_percent_shareholder: false,
              title: 'CEO',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  version: 'compensation-version-scorp',
                  payment_unit: 'Paycheck',
                  flsa_status: 'Owner',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  effective_date: '2024-12-24',
                  rate: '150000.00',
                },
              ],
              rate: '150000.00',
              hire_date: '2024-12-24',
            },
          ]),
        ),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Select if employee is a 2% shareholder')).toBeInTheDocument()
      })
    })

    it('does not show the checkbox when taxableAsScorp is false', async () => {
      server.use(
        handleGetCompanyFederalTaxes(() =>
          HttpResponse.json({
            version: '36d35e28689e641e9e153f0324c2625a',
            tax_payer_type: 'C-Corporation',
            taxable_as_scorp: false,
            filing_form: '944',
            has_ein: true,
            ein_verified: false,
            legal_name: 'foobarbaz',
          }),
        ),
      )
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              version: 'job-version-scorp',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Paycheck',
              primary: true,
              two_percent_shareholder: false,
              title: 'CEO',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  version: 'compensation-version-scorp',
                  payment_unit: 'Paycheck',
                  flsa_status: 'Owner',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  effective_date: '2024-12-24',
                  rate: '150000.00',
                },
              ],
              rate: '150000.00',
              hire_date: '2024-12-24',
            },
          ]),
        ),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      expect(
        screen.queryByLabelText('Select if employee is a 2% shareholder'),
      ).not.toBeInTheDocument()
    })
  })

  describe('rate validation messages', () => {
    beforeEach(() => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
    })

    it('should show default rate validation message when rate is invalid', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Salary\/No overtime/i,
      })
      await user.click(exemptOption)

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      expect(screen.getByText('Amount is a required field')).toBeInTheDocument()
    })

    it('should show non-zero rate validation message when rate is zero and flsa status is not exempt', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Paid by the hour/i,
      })
      await user.click(exemptOption)

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '0')

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      expect(screen.getByText('Amount must be at least $1.00')).toBeInTheDocument()
    })

    it('should show exempt threshold validation message when flsa status is exempt and rate is below FLSA limit', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(employmentTypeControl)

      const exemptOption = screen.getByRole('option', {
        name: /Salary\/No overtime/i,
      })
      await user.click(exemptOption)

      const compensationAmountInput = screen.getByLabelText('Wage')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '0')

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      expect(
        screen.getByText(/FLSA Exempt employees must meet salary threshold of/),
      ).toBeInTheDocument()
    })
  })

  // Pins the underlying request sequence the state-machine flow drives. The
  // existing presentation/integration tests above assert UI/event outcomes;
  // these wrap MSW handlers in `vi.fn()` so a future hook migration can prove
  // parity by re-running this suite. Each test maps to a UAC code from
  // `docs/reference/jobs-and-compensations.md`.
  describe('API request sequencing', () => {
    it('ONB-01: no jobs → POST /v1/employees/:id/jobs then PUT /v1/compensations/:id (no POST /jobs/:id/compensations)', async () => {
      const user = userEvent.setup()
      let createJobBody: Record<string, unknown> | null = null
      const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'new-job-uuid',
            version: 'new-job-version',
            employee_uuid: 'employee-uuid',
            current_compensation_uuid: 'new-compensation-uuid',
            payment_unit: 'Hour',
            primary: true,
            title: 'My Job',
            two_percent_shareholder: false,
            state_wc_covered: null,
            state_wc_class_code: null,
            hire_date: '2024-12-24',
            rate: '50.00',
            compensations: [
              {
                uuid: 'new-compensation-uuid',
                version: 'new-compensation-version',
                job_uuid: 'new-job-uuid',
                payment_unit: 'Hour',
                flsa_status: 'Nonexempt',
                rate: '50.00',
                effective_date: '2024-12-24',
                adjust_for_minimum_wage: false,
              },
            ],
          },
          { status: 201 },
        )
      })
      const updateCompensationResolver = vi.fn(() => HttpResponse.json({}))
      const createCompensationResolver = vi.fn(() => HttpResponse.json({}))

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateEmployeeJob(createJobResolver),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
        handleCreateCompensation(createCompensationResolver),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByRole('heading', { name: 'Compensation' })
      await user.type(screen.getByLabelText('Job Title'), 'My Job')
      await user.click(screen.getByRole('button', { name: /Select an item/i }))
      await user.click(screen.getByRole('option', { name: 'Paid by the hour' }))
      const amount = screen.getByLabelText('Wage')
      await user.clear(amount)
      await user.type(amount, '50')
      await user.tab()

      const continueButtons = screen.getAllByRole('button', { name: 'Continue' })
      await user.click(continueButtons[0]!)

      await waitFor(() => {
        expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
      })

      expect(createJobResolver).toHaveBeenCalledTimes(1)
      expect(createCompensationResolver).not.toHaveBeenCalled()

      expect(createJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
        updateCompensationResolver.mock.invocationCallOrder[0]!,
      )

      expect(createJobBody).toMatchObject({
        title: 'My Job',
        hire_date: '2024-12-24',
      })
    })

    it('ONB-02: revisit single Nonexempt onboarding job → PUT /v1/jobs/:id then PUT /v1/compensations/:id', async () => {
      const user = userEvent.setup()
      const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'job-uuid',
          version: 'job-version-updated',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: body.title ?? 'My Job',
          two_percent_shareholder: false,
          hire_date: '2024-12-24',
          rate: '100.00',
          compensations: [
            {
              uuid: 'compensation-uuid',
              version: 'compensation-version-123',
              job_uuid: 'job-uuid',
              payment_unit: 'Hour',
              flsa_status: 'Nonexempt',
              rate: '100.00',
              effective_date: '2024-12-24',
              adjust_for_minimum_wage: false,
            },
          ],
        })
      })
      const createJobResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))
      const updateCompensationResolver = vi.fn(() => HttpResponse.json({}))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeJob(updateJobResolver),
        handleCreateEmployeeJob(createJobResolver),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByText('Job title')

      const editButton = screen.getByRole('button', { name: /Add another job/i })
      // Sanity that we landed on the jobs list. To test the primary edit path
      // we open the job actions menu on the primary card.
      expect(editButton).toBeInTheDocument()

      const cards = await screen.findAllByTestId('data-card')
      const primaryCard = cards.find(card => card.textContent.includes('My Job'))!
      await user.click(within(primaryCard).getByRole('button', { name: 'Job actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

      await screen.findByRole('heading', { name: 'Edit job' })
      await user.click(screen.getByRole('button', { name: 'Save job' }))

      await waitFor(() => {
        expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
      })

      expect(updateJobResolver).toHaveBeenCalledTimes(1)
      expect(createJobResolver).not.toHaveBeenCalled()

      expect(updateJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
        updateCompensationResolver.mock.invocationCallOrder[0]!,
      )
    })

    it('ONB-03: single non-Nonexempt revisit on hourly switch → PUT /v1/jobs/:id + PUT /v1/compensations/:id then jobs-list redirect', async () => {
      const user = userEvent.setup()
      const updateJobResolver = vi.fn(() =>
        HttpResponse.json({
          uuid: 'job-uuid',
          version: 'job-version-updated',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: 'My Job',
          two_percent_shareholder: false,
          hire_date: '2024-12-24',
          rate: '100.00',
          compensations: [
            {
              uuid: 'compensation-uuid',
              version: 'compensation-version-456',
              job_uuid: 'job-uuid',
              payment_unit: 'Hour',
              flsa_status: 'Nonexempt',
              title: 'My Job',
              rate: '50.00',
              effective_date: '2024-12-24',
              adjust_for_minimum_wage: false,
            },
          ],
        }),
      )
      const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          ...body,
          uuid: 'compensation-uuid',
          job_uuid: 'job-uuid',
        })
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
        handleUpdateEmployeeJob(updateJobResolver),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Salary\/No overtime/i }))
      await user.click(screen.getByRole('option', { name: 'Paid by the hour' }))
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      expect(updateJobResolver).toHaveBeenCalledTimes(1)
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    it('EMF-A07: add secondary → POST /v1/employees/:id/jobs then PUT /v1/compensations/:id (stub-fill)', async () => {
      const user = userEvent.setup()
      const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'secondary-job-uuid',
            version: 'secondary-job-version',
            employee_uuid: 'employee-uuid',
            current_compensation_uuid: 'secondary-comp-uuid',
            payment_unit: 'Hour',
            primary: false,
            title: body.title ?? 'My Job',
            two_percent_shareholder: false,
            hire_date: '2024-12-24',
            rate: '50.00',
            compensations: [
              {
                uuid: 'secondary-comp-uuid',
                version: 'secondary-comp-version',
                job_uuid: 'secondary-job-uuid',
                payment_unit: 'Hour',
                flsa_status: 'Nonexempt',
                rate: '50.00',
                effective_date: '2024-12-24',
                adjust_for_minimum_wage: false,
              },
            ],
          },
          { status: 201 },
        )
      })
      const updateCompensationResolver = vi.fn(() => HttpResponse.json({}))
      const createCompensationResolver = vi.fn(() => HttpResponse.json({}))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleCreateEmployeeJob(createJobResolver),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
        handleCreateCompensation(createCompensationResolver),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />,
      )

      await screen.findByText('Job title')
      await user.click(screen.getByRole('button', { name: /Add another job/i }))
      await screen.findByRole('heading', { name: 'Add job' })

      await user.type(screen.getByLabelText('Job Title'), 'My Job')
      const amount = screen.getByLabelText('Wage')
      await user.clear(amount)
      await user.type(amount, '50')
      await user.tab()
      await user.click(screen.getByRole('button', { name: 'Save job' }))

      await waitFor(() => {
        expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
      })

      expect(createJobResolver).toHaveBeenCalledTimes(1)
      expect(createCompensationResolver).not.toHaveBeenCalled()
    })

    it('EMF-A04: delete secondary fires DELETE /v1/jobs/:id', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      let deletedJobPath: string | null = null
      const deleteJobResolver = vi.fn(({ request }) => {
        deletedJobPath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 }) as never
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
        handleDeleteEmployeeJob(deleteJobResolver),
      )

      renderWithProviders(
        <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })

      const cards = screen.getAllByTestId('data-card')
      const nonPrimary = cards.find(card => card.textContent.includes('An additional job'))!

      await user.click(within(nonPrimary).getByRole('button', { name: 'Job actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

      await waitFor(() => {
        expect(deleteJobResolver).toHaveBeenCalledTimes(1)
      })

      expect(deletedJobPath).toBe('/v1/jobs/job-uuid-2')
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_DELETED, undefined)
    })
  })
})
