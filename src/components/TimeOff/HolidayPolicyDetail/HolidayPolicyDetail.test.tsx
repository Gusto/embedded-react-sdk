import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { HolidayPolicyDetail } from './HolidayPolicyDetail'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockHolidayPayPolicy = {
  version: '1b37938b017c7fd7116bada007072290',
  company_uuid: 'company-123',
  federal_holidays: {
    new_years_day: { selected: true, name: "New Year's Day", date: 'January 1' },
    mlk_day: {
      selected: true,
      name: 'Martin Luther King, Jr. Day',
      date: 'Third Monday in January',
    },
    christmas_day: { selected: true, name: 'Christmas Day', date: 'December 25' },
  },
  employees: [{ uuid: 'emp-1' }, { uuid: 'emp-2' }],
}

const mockEmployees = [
  {
    uuid: 'emp-1',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    jobs: [{ uuid: 'job-1', primary: true, title: 'Engineer' }],
  },
  {
    uuid: 'emp-2',
    first_name: 'Bob',
    last_name: 'Jones',
    email: 'bob@example.com',
    jobs: [{ uuid: 'job-2', primary: true, title: 'Designer' }],
  },
  {
    uuid: 'emp-3',
    first_name: 'Charlie',
    last_name: 'Brown',
    email: 'charlie@example.com',
    jobs: [{ uuid: 'job-3', primary: true, title: 'Manager' }],
  },
]

// 12 enrolled employees → exercises the 10-per-page client pager (2 pages).
const manyEnrolledEmployees = Array.from({ length: 12 }, (_, i) => ({
  uuid: `many-emp-${i}`,
  first_name: `Person${i.toString().padStart(2, '0')}`,
  last_name: 'Roster',
  email: `person${i}@example.com`,
  jobs: [{ uuid: `many-job-${i}`, primary: true, title: 'Engineer' }],
}))

const mockHolidayPayPolicyManyEmployees = {
  ...mockHolidayPayPolicy,
  employees: manyEnrolledEmployees.map(e => ({ uuid: e.uuid })),
}

describe('HolidayPolicyDetail', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy`, () => {
        return HttpResponse.json(mockHolidayPayPolicy)
      }),
      http.get(`${API_BASE_URL}/v1/companies/:companyId/employees`, () => {
        return HttpResponse.json(mockEmployees, {
          headers: {
            'x-total-pages': '1',
            'x-total-count': mockEmployees.length.toString(),
          },
        })
      }),
    )
  })

  describe('holidays tab', () => {
    it('renders only the selected holidays from the policy', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="holidays" />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Holiday pay policy' })).toBeInTheDocument()
      })

      expect(screen.getByText("New Year's Day")).toBeInTheDocument()
      expect(screen.getByText('Martin Luther King, Jr. Day')).toBeInTheDocument()
      expect(screen.getByText('Christmas Day')).toBeInTheDocument()
      expect(screen.queryByText('Independence Day')).not.toBeInTheDocument()
      expect(screen.queryByText('Thanksgiving')).not.toBeInTheDocument()
    })

    it('renders back button and action buttons', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="holidays" />)

      await waitFor(() => {
        expect(screen.getByText('Back to policies')).toBeInTheDocument()
      })

      expect(screen.getByText('Add employees')).toBeInTheDocument()
      expect(screen.getByText('Edit policy')).toBeInTheDocument()
    })

    it('renders icons on the Add employees and Edit policy buttons', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="holidays" />)

      await waitFor(() => {
        expect(screen.getByText('Add employees')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /add employees/i })
      const editButton = screen.getByRole('button', { name: /edit policy/i })

      expect(addButton.querySelector('svg')).toBeInTheDocument()
      expect(editButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('employees tab', () => {
    it('renders employees enrolled in the policy', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument()
    })

    it('filters employees by search', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'Alice')

      await waitFor(() => {
        expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    it('does not render the pagination control when the policy roster is below the page threshold', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
    })

    it('paginates the roster at 10 per page and navigates between pages', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy`, () => {
          return HttpResponse.json(mockHolidayPayPolicyManyEmployees)
        }),
        http.get(`${API_BASE_URL}/v1/companies/:companyId/employees`, () => {
          return HttpResponse.json(manyEnrolledEmployees, {
            headers: {
              'x-total-pages': '1',
              'x-total-count': manyEnrolledEmployees.length.toString(),
            },
          })
        }),
      )

      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Person00 Roster')).toBeInTheDocument()
      })

      expect(screen.getByText('Person09 Roster')).toBeInTheDocument()
      expect(screen.queryByText('Person10 Roster')).not.toBeInTheDocument()
      expect(screen.queryByText('Person11 Roster')).not.toBeInTheDocument()
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Navigate to next page' }))

      expect(await screen.findByText('Person10 Roster')).toBeInTheDocument()
      expect(await screen.findByText('Person11 Roster')).toBeInTheDocument()
      expect(screen.queryByText('Person00 Roster')).not.toBeInTheDocument()
    })

    it('resets to page 1 when a search filters the roster below the page threshold', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy`, () => {
          return HttpResponse.json(mockHolidayPayPolicyManyEmployees)
        }),
        http.get(`${API_BASE_URL}/v1/companies/:companyId/employees`, () => {
          return HttpResponse.json(manyEnrolledEmployees, {
            headers: {
              'x-total-pages': '1',
              'x-total-count': manyEnrolledEmployees.length.toString(),
            },
          })
        }),
      )

      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Person00 Roster')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Navigate to next page' }))

      expect(await screen.findByText('Person10 Roster')).toBeInTheDocument()

      await user.type(screen.getByRole('searchbox'), 'Person00')

      await waitFor(() => {
        expect(screen.queryByText('Person10 Roster')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Person00 Roster')).toBeInTheDocument()
      expect(screen.queryByText('Person11 Roster')).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('fires TIME_OFF_BACK_TO_LIST when back is clicked', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="holidays" />)

      await waitFor(() => {
        expect(screen.getByText('Back to policies')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Back to policies'))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_BACK_TO_LIST)
    })
  })

  describe('remove employee', () => {
    it('opens remove dialog and calls remove API on confirm', async () => {
      let removeCalled = false
      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy/remove`, () => {
          removeCalled = true
          return HttpResponse.json({
            ...mockHolidayPayPolicy,
            employees: [{ uuid: 'emp-2' }],
          })
        }),
      )

      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /Actions for/i })
      await user.click(menuButtons[0]!)

      const menuRemoveButton = await screen.findByRole('menuitem', { name: 'Remove' })
      await user.click(menuRemoveButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialogConfirmButtons = screen.getAllByRole('button', { name: 'Remove' })
      const dialogConfirm = dialogConfirmButtons.find(btn =>
        screen.getByRole('dialog').contains(btn),
      )
      await user.click(dialogConfirm!)

      await waitFor(() => {
        expect(removeCalled).toBe(true)
      })
    })

    it('closes remove dialog on cancel', async () => {
      renderWithProviders(<HolidayPolicyDetail {...defaultProps} defaultTab="employees" />)

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /Actions for/i })
      await user.click(menuButtons[0]!)

      const menuRemoveButton = await screen.findByRole('menuitem', { name: 'Remove' })
      await user.click(menuRemoveButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})
