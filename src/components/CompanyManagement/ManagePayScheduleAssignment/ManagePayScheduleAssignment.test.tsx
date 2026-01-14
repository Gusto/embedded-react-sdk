import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ManagePayScheduleAssignment } from './ManagePayScheduleAssignment'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleAssignment', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe('single assignment type', () => {
    it('renders single schedule selector', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Assign employees')).toBeInTheDocument()
      })

      expect(screen.getByText('Pay schedule')).toBeInTheDocument()
    })

    it('has Continue button disabled initially', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      const continueButton = await screen.findByRole('button', { name: 'Continue' })
      expect(continueButton).toBeDisabled()
    })

    it('enables Continue button after user selects a different value', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Pay schedule')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      expect(continueButton).toBeDisabled()

      const selectButton = screen.getByRole('button', { name: /Pay schedule/ })
      await user.click(selectButton)

      const listbox = await screen.findByRole('listbox')
      const options = within(listbox).getAllByRole('option')
      const optionToClick = options.length > 1 ? options[1] : options[0]
      if (optionToClick) {
        await user.click(optionToClick)
      }

      expect(continueButton).toBeEnabled()
    })

    it('fires continue event with assignment data after selection', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Pay schedule')).toBeInTheDocument()
      })

      const selectButton = screen.getByRole('button', { name: /Pay schedule/ })
      await user.click(selectButton)

      const listbox = await screen.findByRole('listbox')
      const options = within(listbox).getAllByRole('option')
      const optionToClick = options.length > 1 ? options[1] : options[0]
      if (optionToClick) {
        await user.click(optionToClick)
      }

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.MANAGE_PAY_SCHEDULE_ASSIGNMENT_CONTINUE,
        expect.objectContaining({
          type: 'single',
          defaultPayScheduleUuid: expect.any(String),
        }),
      )
    })
  })

  describe('hourly/salaried assignment type', () => {
    it('renders hourly and salaried selectors', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.HourlySalaried}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Hourly/Non-exempt')).toBeInTheDocument()
        expect(screen.getByText('Salaried/Exempt')).toBeInTheDocument()
      })
    })

    it('has Continue button disabled initially', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.HourlySalaried}
          onEvent={onEvent}
        />,
      )

      const continueButton = await screen.findByRole('button', { name: 'Continue' })
      expect(continueButton).toBeDisabled()
    })
  })

  describe('by employee assignment type', () => {
    it('renders employee list with selectors', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.ByEmployee}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('displays compensation type for employees', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.ByEmployee}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Hourly / Nonexempt')).toBeInTheDocument()
        expect(screen.getByText('Salaried / Exempt')).toBeInTheDocument()
      })
    })

    it('has Continue button disabled initially', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.ByEmployee}
          onEvent={onEvent}
        />,
      )

      const continueButton = await screen.findByRole('button', { name: 'Continue' })
      expect(continueButton).toBeDisabled()
    })
  })

  describe('by department assignment type', () => {
    it('renders department selectors', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.ByDepartment}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument()
        expect(screen.getByText('Sales')).toBeInTheDocument()
      })
    })

    it('has Continue button disabled initially', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.ByDepartment}
          onEvent={onEvent}
        />,
      )

      const continueButton = await screen.findByRole('button', { name: 'Continue' })
      expect(continueButton).toBeDisabled()
    })
  })

  describe('create new pay schedule', () => {
    it('renders Add new pay schedule button', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add new pay schedule' })).toBeInTheDocument()
      })
    })

    it('fires create new event when Add new pay schedule button is clicked', async () => {
      renderWithProviders(
        <ManagePayScheduleAssignment
          companyId="company-123"
          assignmentType={PayScheduleAssignmentBodyType.Single}
          onEvent={onEvent}
        />,
      )

      const addButton = await screen.findByRole('button', { name: 'Add new pay schedule' })
      await user.click(addButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW, {
        returnContext: 'header',
      })
    })
  })

  it('fires back event when Back is clicked', async () => {
    renderWithProviders(
      <ManagePayScheduleAssignment
        companyId="company-123"
        assignmentType={PayScheduleAssignmentBodyType.Single}
        onEvent={onEvent}
      />,
    )

    const backButton = await screen.findByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.MANAGE_PAY_SCHEDULE_BACK)
  })
})
