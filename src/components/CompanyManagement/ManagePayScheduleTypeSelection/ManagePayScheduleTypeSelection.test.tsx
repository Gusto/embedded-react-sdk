import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManagePayScheduleTypeSelection } from './ManagePayScheduleTypeSelection'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleTypeSelection', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders assignment type options', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection companyId="company-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Choose schedule type' })).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Everyone on one schedule/)).toBeInTheDocument()
    expect(screen.getByLabelText(/By compensation type/)).toBeInTheDocument()
    expect(screen.getByLabelText(/By employee/)).toBeInTheDocument()
    expect(screen.getByLabelText(/By department/)).toBeInTheDocument()
  })

  it('defaults to single schedule when no currentType is provided', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection companyId="company-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      const singleOption = screen.getByLabelText(/Everyone on one schedule/)
      expect(singleOption).toBeChecked()
    })
  })

  it('uses currentType prop as default selection', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection
        companyId="company-123"
        currentType="by_employee"
        onEvent={onEvent}
      />,
    )

    await waitFor(() => {
      const byEmployeeOption = screen.getByLabelText(/By employee/)
      expect(byEmployeeOption).toBeChecked()
    })
  })

  it('fires type selected event when Continue is clicked', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection companyId="company-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Choose schedule type' })).toBeInTheDocument()
    })

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED,
      expect.objectContaining({ type: 'single' }),
    )
  })

  it('fires cancel event when Back is clicked', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection companyId="company-123" onEvent={onEvent} />,
    )

    const backButton = await screen.findByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.MANAGE_PAY_SCHEDULE_CANCEL)
  })

  it('allows changing selection and submitting new type', async () => {
    renderWithProviders(
      <ManagePayScheduleTypeSelection companyId="company-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Choose schedule type' })).toBeInTheDocument()
    })

    const byDepartmentOption = screen.getByLabelText(/By department/)
    await user.click(byDepartmentOption)

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED,
      expect.objectContaining({ type: 'by_department' }),
    )
  })
})
