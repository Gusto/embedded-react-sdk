import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { ManagementEmployeeList } from './ManagementEmployeeList'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyEmployees,
  handleUpdateEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagementEmployeeList', () => {
  beforeEach(() => {
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([
          {
            uuid: 'some-unique-id',
            first_name: 'Sean',
            last_name: 'Test',
            payment_method: 'Direct Deposit',
          },
        ]),
      ),
    )
  })

  it('renders a list of employees', async () => {
    renderWithProviders(<ManagementEmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    await waitFor(async () => {
      await screen.findByText('Employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <ManagementEmployeeList
        companyId="some-company-uuid"
        onEvent={vi.fn()}
        className="custom-class"
      />,
    )

    await screen.findByText('Sean Test')

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('moves a self-onboarded employee into admin review when the user selects Review employee', async () => {
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([
          {
            uuid: 'employee-to-review',
            first_name: 'Ada',
            last_name: 'Lovelace',
            onboarded: false,
            onboarding_status: 'self_onboarding_completed_by_employee',
          },
        ]),
      ),
      handleUpdateEmployeeOnboardingStatus(() =>
        HttpResponse.json({
          uuid: 'employee-to-review',
          onboarding_status: 'self_onboarding_awaiting_admin_review',
        }),
      ),
    )

    const onEvent = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ManagementEmployeeList
        companyId="some-company-uuid"
        initialTab="onboarding"
        onEvent={onEvent}
      />,
    )

    await screen.findByText('Ada Lovelace')

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByText('Review employee'))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_MANAGEMENT_REVIEW, {
        employeeId: 'employee-to-review',
        onboardingStatus: 'self_onboarding_awaiting_admin_review',
      })
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
      expect.objectContaining({
        uuid: 'employee-to-review',
        onboardingStatus: 'self_onboarding_awaiting_admin_review',
      }),
    )
  })

  it('resumes review without updating the status for an employee already in admin review', async () => {
    const updateOnboardingStatusResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([
          {
            uuid: 'employee-in-review',
            first_name: 'Ada',
            last_name: 'Lovelace',
            onboarded: false,
            onboarding_status: 'self_onboarding_awaiting_admin_review',
          },
        ]),
      ),
      handleUpdateEmployeeOnboardingStatus(updateOnboardingStatusResolver),
    )

    const onEvent = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ManagementEmployeeList
        companyId="some-company-uuid"
        initialTab="onboarding"
        onEvent={onEvent}
      />,
    )

    await screen.findByText('Ada Lovelace')

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByText('Review employee'))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_MANAGEMENT_REVIEW, {
        employeeId: 'employee-in-review',
        onboardingStatus: 'self_onboarding_awaiting_admin_review',
      })
    })
    expect(updateOnboardingStatusResolver).not.toHaveBeenCalled()
  })
})
