import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { RehireEmployee } from './RehireEmployee'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { getCompanyLocations, getEmptyCompanyLocations } from '@/test/mocks/apis/company_locations'
import { handleCreateEmployeeRehire, createEmployeeRehire } from '@/test/mocks/apis/employees'

const mockEmployee = {
  uuid: 'employee-123',
  first_name: 'Morgan',
  last_name: 'Diaz',
  terminated: true,
}

describe('RehireEmployee', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    employeeId: 'employee-123',
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => HttpResponse.json(mockEmployee)),
      getCompanyLocations,
      createEmployeeRehire,
    )
  })

  describe('rendering', () => {
    it('renders the rehire form with the employee name and fields', async () => {
      renderWithProviders(<RehireEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Rehire Morgan Diaz' })).toBeInTheDocument()
      })

      expect(
        screen.getByText(
          'Schedule a return to work date and confirm where this employee will work.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Start date')).toBeInTheDocument()
      expect(screen.getByText('Work address')).toBeInTheDocument()
      expect(screen.getByText('File a new hire report')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Schedule rehire' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('schedules the rehire and fires EMPLOYEE_REHIRE_SCHEDULED, returning to the list', async () => {
      let rehireBody: Record<string, unknown> | null = null
      const createRehireResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        rehireBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { version: 'rehire-version-1', ...rehireBody, active: false },
          { status: 201 },
        )
      })
      server.use(handleCreateEmployeeRehire(createRehireResolver))

      renderWithProviders(<RehireEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Schedule rehire' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Schedule rehire' }))

      await waitFor(() => {
        expect(createRehireResolver).toHaveBeenCalledTimes(1)
      })

      expect(rehireBody).toMatchObject({
        work_location_uuid: '123e4567-e89b-12d3-a456-426614174000',
        file_new_hire_report: true,
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_REHIRE_SCHEDULED,
          expect.objectContaining({ employeeId: 'employee-123' }),
        )
      })
    })
  })

  describe('cancel action', () => {
    it('emits EMPLOYEE_REHIRE_CANCELLED when cancel is clicked', async () => {
      renderWithProviders(<RehireEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_REHIRE_CANCELLED, {
        employeeId: 'employee-123',
      })
    })
  })

  describe('form validation', () => {
    it('shows a validation error and does not submit when no work address is available', async () => {
      const createRehireResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({}, { status: 201 }),
      )
      server.use(getEmptyCompanyLocations, handleCreateEmployeeRehire(createRehireResolver))

      renderWithProviders(<RehireEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Schedule rehire' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Schedule rehire' }))

      await waitFor(() => {
        expect(screen.getByText('Select a work address')).toBeInTheDocument()
      })

      expect(createRehireResolver).not.toHaveBeenCalled()
      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_REHIRE_SCHEDULED,
        expect.anything(),
      )
    })
  })
})
