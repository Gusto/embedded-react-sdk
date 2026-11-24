import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
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

function mockEmployee(employee: Record<string, unknown>) {
  server.use(
    handleGetCompanyEmployees(() =>
      HttpResponse.json([
        { uuid: 'employee-1', first_name: 'Ada', last_name: 'Lovelace', ...employee },
      ]),
    ),
  )
}

async function openMenu() {
  const user = userEvent.setup()
  await screen.findByText('Ada Lovelace')
  await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
  return user
}

async function menuItemLabels() {
  const items = await screen.findAllByRole('menuitem')
  return items.map(item => item.textContent)
}

describe('ManagementEmployeeList', () => {
  beforeEach(() => {
    mockEmployee({ onboarded: true, onboarding_status: 'onboarding_completed' })
  })

  it('renders a list of employees', async () => {
    renderWithProviders(<ManagementEmployeeList companyId="company-1" onEvent={() => {}} />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <ManagementEmployeeList companyId="company-1" onEvent={vi.fn()} className="custom-class" />,
    )

    await screen.findByText('Ada Lovelace')

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  describe('onboarded employee', () => {
    it('offers Edit employee and Dismiss employee', async () => {
      renderWithProviders(<ManagementEmployeeList companyId="company-1" onEvent={vi.fn()} />)

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Edit employee', 'Dismiss employee'])
    })

    it('fires employee/update when Edit employee is selected', async () => {
      const onEvent = vi.fn()
      renderWithProviders(<ManagementEmployeeList companyId="company-1" onEvent={onEvent} />)

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Edit employee' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_UPDATE, {
        employeeId: 'employee-1',
      })
    })

    it('offers only Edit employee on the Onboarding tab before the start date', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Edit employee'])
    })
  })

  describe('employee onboarded by an admin', () => {
    beforeEach(() => {
      mockEmployee({ onboarded: false, onboarding_status: 'admin_onboarding_incomplete' })
    })

    it('offers Continue onboarding and Delete employee', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Continue onboarding', 'Delete employee'])
    })

    it('fires employee/management/continueOnboarding when Continue onboarding is selected', async () => {
      const onEvent = vi.fn()
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={onEvent} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Continue onboarding' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_CONTINUE_ONBOARDING,
        {
          employeeId: 'employee-1',
          onboardingStatus: 'admin_onboarding_incomplete',
        },
      )
    })

    it('asks to confirm before deleting', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Delete employee' }))

      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText('Delete employee?')).toBeInTheDocument()
    })
  })

  describe('employee invited to self-onboard', () => {
    beforeEach(() => {
      mockEmployee({ onboarded: false, onboarding_status: 'self_onboarding_invited' })
    })

    it('offers Cancel self-onboarding and Delete employee', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Cancel self-onboarding', 'Delete employee'])
    })

    it('cancels self-onboarding after confirmation', async () => {
      let requestBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'employee-1',
          onboarding_status: 'admin_onboarding_incomplete',
        })
      })
      server.use(handleUpdateEmployeeOnboardingStatus(updateResolver))
      const onEvent = vi.fn()
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={onEvent} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Cancel self-onboarding' }))
      const dialog = await screen.findByRole('dialog')
      expect(
        within(dialog).getByText(
          "Ada Lovelace won't be able to finish onboarding on their own. You'll need to finish onboarding for them or send a new invite.",
        ),
      ).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Cancel self-onboarding' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
          expect.objectContaining({
            uuid: 'employee-1',
            onboardingStatus: 'admin_onboarding_incomplete',
          }),
        )
      })
      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(requestBody).toMatchObject({ onboarding_status: 'admin_onboarding_incomplete' })
    })

    it('leaves self-onboarding in place when the confirmation is dismissed', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
      server.use(handleUpdateEmployeeOnboardingStatus(updateResolver))
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Cancel self-onboarding' }))
      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Go back' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull()
      })
      expect(updateResolver).not.toHaveBeenCalled()
    })
  })

  describe('employee who finished self-onboarding', () => {
    beforeEach(() => {
      mockEmployee({ onboarded: false, onboarding_status: 'self_onboarding_completed_by_employee' })
    })

    it('offers Review employee and Delete employee', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Review employee', 'Delete employee'])
    })

    it('moves the employee into admin review, then opens the onboarding steps', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          uuid: 'employee-1',
          onboarding_status: 'self_onboarding_awaiting_admin_review',
        }),
      )
      server.use(handleUpdateEmployeeOnboardingStatus(updateResolver))
      const onEvent = vi.fn()
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={onEvent} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Review employee' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_CONTINUE_ONBOARDING,
          {
            employeeId: 'employee-1',
            onboardingStatus: 'self_onboarding_awaiting_admin_review',
          },
        )
      })
      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(onEvent.mock.calls.map(([eventType]) => eventType)).toEqual([
        componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
        componentEvents.EMPLOYEE_MANAGEMENT_CONTINUE_ONBOARDING,
      ])
    })

    it('disables Review employee while the status update is in flight', async () => {
      let releaseUpdate: () => void = () => {}
      const updateResolver = vi.fn<HttpResponseResolver>(
        () =>
          new Promise(resolve => {
            releaseUpdate = () => {
              resolve(
                HttpResponse.json({
                  uuid: 'employee-1',
                  onboarding_status: 'self_onboarding_awaiting_admin_review',
                }),
              )
            }
          }),
      )
      server.use(handleUpdateEmployeeOnboardingStatus(updateResolver))
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Review employee' }))
      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))

      expect(await screen.findByRole('menuitem', { name: 'Review employee' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      releaseUpdate()
    })

    it('fires no events when the status update fails', async () => {
      server.use(
        handleUpdateEmployeeOnboardingStatus(() =>
          HttpResponse.json({ errors: [] }, { status: 500 }),
        ),
      )
      const onEvent = vi.fn()
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={onEvent} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Review employee' }))

      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(onEvent).not.toHaveBeenCalled()
    })
  })

  describe('employee awaiting admin review', () => {
    beforeEach(() => {
      mockEmployee({ onboarded: false, onboarding_status: 'self_onboarding_awaiting_admin_review' })
    })

    it('offers Review employee and Delete employee', async () => {
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={vi.fn()} />,
      )

      await openMenu()

      expect(await menuItemLabels()).toEqual(['Review employee', 'Delete employee'])
    })

    it('resumes the review without updating the status', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
      server.use(handleUpdateEmployeeOnboardingStatus(updateResolver))
      const onEvent = vi.fn()
      renderWithProviders(
        <ManagementEmployeeList companyId="company-1" initialTab="onboarding" onEvent={onEvent} />,
      )

      const user = await openMenu()
      await user.click(await screen.findByRole('menuitem', { name: 'Review employee' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_CONTINUE_ONBOARDING,
        {
          employeeId: 'employee-1',
          onboardingStatus: 'self_onboarding_awaiting_admin_review',
        },
      )
      expect(updateResolver).not.toHaveBeenCalled()
    })
  })
})
