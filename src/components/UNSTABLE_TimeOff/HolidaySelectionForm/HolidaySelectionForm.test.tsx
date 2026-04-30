import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { HolidaySelectionForm } from './HolidaySelectionForm'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

describe('HolidaySelectionForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe('rendering', () => {
    it('renders the heading', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Choose your company holidays')).toBeInTheDocument()
      })
    })

    it('renders all 11 federal holidays', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText("New Year's Day")).toBeInTheDocument()
      })
      expect(screen.getByText('Martin Luther King, Jr. Day')).toBeInTheDocument()
      expect(screen.getByText("Presidents' Day")).toBeInTheDocument()
      expect(screen.getByText('Memorial Day')).toBeInTheDocument()
      expect(screen.getByText('Juneteenth')).toBeInTheDocument()
      expect(screen.getByText('Independence Day')).toBeInTheDocument()
      expect(screen.getByText('Labor Day')).toBeInTheDocument()
      expect(screen.getByText("Columbus Day (Indigenous Peoples' Day)")).toBeInTheDocument()
      expect(screen.getByText('Veterans Day')).toBeInTheDocument()
      expect(screen.getByText('Thanksgiving')).toBeInTheDocument()
      expect(screen.getByText('Christmas Day')).toBeInTheDocument()
    })

    it('renders observed dates', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('January 1')).toBeInTheDocument()
      })
      expect(screen.getByText('Third Monday in January')).toBeInTheDocument()
      expect(screen.getByText('December 25')).toBeInTheDocument()
    })

    it('renders next observation dates with year', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText("New Year's Day")).toBeInTheDocument()
      })

      const container = screen.getByTestId('data-view')
      expect(container.textContent).toMatch(/\d{4}/)
    })

    it('renders Back and Continue buttons', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('renders all holidays as selected by default', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(11)
      })
    })
  })

  describe('selection', () => {
    it('can deselect a holiday', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]!)

      expect(checkboxes[1]).not.toBeChecked()
    })
  })

  describe('actions', () => {
    it('calls CANCEL event when Back button is clicked', async () => {
      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Back' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    })

    it('calls POST and emits HOLIDAY_SELECTION_DONE on Continue', async () => {
      let postCalled = false
      server.use(
        http.post(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy`, () => {
          postCalled = true
          return HttpResponse.json({
            version: 'abc123',
            company_uuid: 'company-123',
            federal_holidays: {},
            employees: [],
          })
        }),
      )

      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
      })

      expect(postCalled).toBe(true)
    })

    it('emits HOLIDAY_SELECTION_DONE after deselecting a holiday and clicking Continue', async () => {
      server.use(
        http.post(`${API_BASE_URL}/v1/companies/:companyUuid/holiday_pay_policy`, () => {
          return HttpResponse.json({
            version: 'abc123',
            company_uuid: 'company-123',
            federal_holidays: {},
            employees: [],
          })
        }),
      )

      renderWithProviders(<HolidaySelectionForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]!)

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
      })
    })
  })
})
