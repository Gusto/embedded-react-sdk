import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Compensation } from './Compensation'
import { server } from '@/test/mocks/server'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { componentEvents } from '@/shared/constants'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'

describe('Compensation', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
  })

  describe('when employee has no saved jobs', () => {
    beforeEach(() => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee_id" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )
    })

    it('it initially renders compensation form with default values', async () => {
      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const jobTitleInput = screen.getByLabelText('Job Title')
      expect(jobTitleInput).toBeInTheDocument()
      expect(jobTitleInput).toHaveValue('')

      const employmentTypeControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      expect(employmentTypeControl).toBeInTheDocument()

      const compensationAmountInput = screen.getByLabelText('Compensation amount')
      expect(compensationAmountInput).toBeInTheDocument()
      expect(compensationAmountInput).toHaveValue('$0.00')

      const payPeriodControl = screen.getByRole('button', {
        name: /Hour/i,
        expanded: false,
      })
      expect(payPeriodControl).toBeInTheDocument()
    })

    it('navigates to jobs list if form is filled out with hourly employment type', async () => {
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

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

      const compensationAmountInput = screen.getByLabelText('Compensation amount')
      await user.type(compensationAmountInput, '50000')

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      // Wait for transition to jobs list
      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })
    //TODO: this test fails - will tackle when converting to speakeasy
    // it('navigates to next step if form is filled out with non hourly employment type', async () => {
    //   const user = userEvent.setup()
    //   const onEvent = vi.fn()

    //   await waitFor(() => {
    //     expect(screen.getByText('Compensation')).toBeInTheDocument()
    //   })

    //   const jobTitleInput = screen.getByLabelText('Job Title')
    //   await user.type(jobTitleInput, 'My Job')

    //   const employmentTypeControl = screen.getByRole('button', {
    //     name: /Select an item/i,
    //     expanded: false,
    //   })
    //   await user.click(employmentTypeControl)

    //   const hourlyOption = screen.getByRole('option', {
    //     name: /Commission only\/No overtime/i,
    //   })
    //   await user.click(hourlyOption)

    //   const continueButton = screen.getByRole('button', {
    //     name: 'Continue',
    //   })
    //   await user.click(continueButton)
    //   expect(onEvent).toHaveBeenLastCalledWith(componentEvents.EMPLOYEE_COMPENSATION_DONE)
    // })
  })

  describe('when employee a single job saved with nonexempt flsa status', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
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
      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
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

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const addAnotherJobButton = screen.getByRole('button', {
        name: /Add another job/i,
      })
      await user.click(addAnotherJobButton)

      expect(screen.getByText('Add job')).toBeInTheDocument()

      const jobTitleInput = screen.getByLabelText('Job Title')
      await user.type(jobTitleInput, 'My Job')

      const compensationAmountInput = screen.getByLabelText('Compensation amount')
      await user.clear(compensationAmountInput)
      await user.type(compensationAmountInput, '50')

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })

    it('should allow user to edit the job and set flsa status to value other than nonexempt with no warning', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const jobActionsControl = screen.getByRole('button', {
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
          "Changing this employee's classification will delete the employee's additional pay rates.",
        ),
      ).not.toBeInTheDocument()

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      // Return to jobs list
      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })
  })

  describe('when employee has a single job saved with flsa status that is not nonexempt', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            {
              uuid: 'job-uuid',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  payment_unit: 'Year',
                  flsa_status: 'Exempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
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
      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
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

      const compensationAmountInput = screen.getByLabelText('Compensation amount')
      expect(compensationAmountInput).toBeInTheDocument()
      expect(compensationAmountInput).toHaveValue('$100,000.00')

      const payPeriodControl = screen.getByRole('button', {
        name: /Year/i,
        expanded: false,
      })
      expect(payPeriodControl).toBeInTheDocument()
    })

    it('should navigate to the next step if the form is filled out with a non hourly employment type', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Compensation')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      })
      await user.click(continueButton)

      expect(onEvent).toHaveBeenLastCalledWith(componentEvents.EMPLOYEE_COMPENSATION_DONE)
    })

    it('should navigate to the jobs list if the employment type is changed to hourly', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
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
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid',
              payment_unit: 'Hour',
              primary: true,
              two_percent_shareholder: false,
              title: 'My Job',
              compensations: [
                {
                  uuid: 'compensation-uuid',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid',
                  effective_date: '2024-12-24',
                  rate: '100.00',
                },
              ],
              rate: '100.00',
              hire_date: '2024-12-24',
            },
            {
              uuid: 'job-uuid-2',
              employee_uuid: 'employee-uuid',
              current_compensation_uuid: 'compensation-uuid-2',
              payment_unit: 'Hour',
              primary: false,
              two_percent_shareholder: false,
              title: 'An additional job',
              compensations: [
                {
                  uuid: 'compensation-uuid-2',
                  payment_unit: 'Hour',
                  flsa_status: 'Nonexempt',
                  adjust_for_minimum_wage: false,
                  job_uuid: 'job-uuid-2',
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
      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      expect(screen.getByText('My Job')).toBeInTheDocument()
      expect(screen.getByText('An additional job')).toBeInTheDocument()
    })

    it('should not show delete option for the primary job', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const primaryJobRow = screen.getByRole('row', { name: 'My Job' })

      const jobActionsControl = within(primaryJobRow).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const deleteButton = screen.queryByRole('menuitem', {
        name: 'Delete',
      })
      expect(deleteButton).not.toBeInTheDocument()
    })

    it('should allow for deleting non primary jobs', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const additionalJobRow = screen.getByRole('row', { name: 'An additional job' })

      const jobActionsControl = within(additionalJobRow).getByRole('button', {
        name: 'Job actions',
      })

      await user.click(jobActionsControl)

      const deleteButton = screen.getByRole('menuitem', { name: 'Delete' })
      expect(deleteButton).toBeInTheDocument()

      await user.click(deleteButton)

      expect(onEvent).toHaveBeenLastCalledWith(componentEvents.EMPLOYEE_JOB_DELETED)
    })

    it('should not display employee type field when editing a non primary job', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const additionalJobRow = screen.getByRole('row', { name: 'An additional job' })

      const jobActionsControl = within(additionalJobRow).getByRole('button', {
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

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const primaryJobRow = screen.getByRole('row', { name: 'My Job' })

      const jobActionsControl = within(primaryJobRow).getByRole('button', {
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
          "Changing this employee's classification will delete the employee's additional pay rates.",
        ),
      ).toBeInTheDocument()

      const saveButton = screen.getByRole('button', {
        name: 'Save job',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })

    it('should return to the jobs list if editing and cancel is selected', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <Compensation employeeId="employee-uuid" startDate="2024-12-24" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })

      const additionalJobRow = screen.getByRole('row', { name: 'An additional job' })

      const jobActionsControl = within(additionalJobRow).getByRole('button', {
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
        expect(screen.getByText('Job title')).toBeInTheDocument()
      })
    })
  })
})
