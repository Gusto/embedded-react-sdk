import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { EmployeeList } from './EmployeeList'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyEmployees,
  handleUpdateEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('EmployeeList', () => {
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
    renderWithProviders(<EmployeeList companyId="some-company-uuid" onEvent={() => {}} />)

    await waitFor(async () => {
      await screen.findByText('Your employees')
      expect(screen.getByText('Sean Test')).toBeTruthy()
    })
  })

  it('emits EMPLOYEE_UPDATE with the employeeId when reviewing a self-onboarded employee', async () => {
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

    renderWithProviders(<EmployeeList companyId="some-company-uuid" onEvent={onEvent} />)

    await screen.findByText('Ada Lovelace')

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByText('Review'))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_UPDATE,
        expect.objectContaining({ employeeId: 'employee-to-review' }),
      )
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
      expect.objectContaining({
        uuid: 'employee-to-review',
        onboardingStatus: 'self_onboarding_awaiting_admin_review',
      }),
    )
  })
})
