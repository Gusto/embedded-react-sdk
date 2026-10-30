import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { TransitionCreation } from './TransitionCreation'
import { API_BASE_URL } from '@/test/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleCreateOffCyclePayroll } from '@/test/mocks/apis/terminations'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const START_DATE = '2025-08-14'
const END_DATE = '2025-08-27'
const PAY_SCHEDULE_UUID = 'schedule-1'

describe('TransitionCreation', () => {
  const defaultProps = {
    companyId: COMPANY_ID,
    startDate: START_DATE,
    endDate: END_DATE,
    payScheduleUuid: PAY_SCHEDULE_UUID,
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    setupApiTestMocks()

    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /transition payroll/i, level: 2 }),
        ).toBeInTheDocument()
      })
    })

    it('renders the transition explanation alert', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('renders the transition details section', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/transition details/i)).toBeInTheDocument()
      })
    })

    it('renders the check date input', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/check date/i)).toBeInTheDocument()
      })
    })

    it('renders the continue button', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      const { container } = renderWithProviders(
        <TransitionCreation {...defaultProps} className="custom-class" />,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /transition payroll/i, level: 2 }),
        ).toBeInTheDocument()
      })
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('deductions and contributions', () => {
    it('renders the deductions radio group defaulting to include', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByLabelText(/make all the regular deductions and contributions/i),
        ).toBeInTheDocument()
      })

      expect(
        screen.getByLabelText(/make all the regular deductions and contributions/i),
      ).toBeChecked()
      expect(screen.getByLabelText(/block all deductions and contributions/i)).not.toBeChecked()
    })

    it('allows switching to skip deductions', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByLabelText(/make all the regular deductions and contributions/i),
        ).toBeInTheDocument()
      })

      const skipRadio = screen.getByLabelText(/block all deductions and contributions/i)
      await user.click(skipRadio)

      expect(skipRadio).toBeChecked()
      expect(
        screen.getByLabelText(/make all the regular deductions and contributions/i),
      ).not.toBeChecked()
    })
  })

  describe('tax withholding rates', () => {
    it('uses the matching schedule rather than the first active schedule', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json([
            { uuid: 'other', version: 'v1', active: true, frequency: 'Monthly' },
            { uuid: PAY_SCHEDULE_UUID, version: 'v2', active: false, frequency: 'Every week' },
          ]),
        ),
      )
      renderWithProviders(<TransitionCreation {...defaultProps} />)
      expect(await screen.findAllByText(/regular wages, paid every week/i)).toHaveLength(2)
    })

    it('falls back when the transition schedule cannot be found', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} payScheduleUuid="missing" />)
      expect(await screen.findAllByText(/regular wages, paid every other week/i)).toHaveLength(2)
    })

    it('renders the tax withholding rates table', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText('Regular hours, regular wages, and tips')).toBeInTheDocument()
      expect(screen.getByText('Supplemental wages, bonus wages, commission')).toBeInTheDocument()
      expect(screen.getByText('Reimbursements')).toBeInTheDocument()
    })

    it('opens the modal when Edit is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })
    })

    it('does not change config when modal Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getAllByText(/regular wages, paid every week/i).length).toBeGreaterThanOrEqual(
        1,
      )

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i, hidden: true })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Rate for regular wages and earnings')).not.toBeInTheDocument()
      })

      expect(screen.getAllByText(/regular wages, paid every week/i).length).toBeGreaterThanOrEqual(
        1,
      )
    })

    it('defaults to regular withholding rate for transition payrolls', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      const regularWagesTexts = screen.getAllByText(/regular wages, paid every week/i)
      expect(regularWagesTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('validation', () => {
    it('shows check date required error when submitting without a date', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/check date is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('creates a transition payroll and emits the transition/created event on success', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      const checkDateGroup = screen.getByRole('group', { name: /check date/i })
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /day/i }), '15')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      await waitFor(() => {
        expect(within(checkDateGroup).getByRole('spinbutton', { name: /year/i })).toHaveAttribute(
          'aria-valuenow',
          '2026',
        )
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          'transition/created',
          expect.objectContaining({ payrollUuid: 'transition-payroll-uuid-1' }),
        )
      })
    })
  })

  describe('in a timezone ahead of UTC', () => {
    const originalTz = process.env.TZ

    beforeEach(() => {
      process.env.TZ = 'Asia/Kolkata'
    })

    afterEach(() => {
      process.env.TZ = originalTz
    })

    it('sends the picked check date without shifting it a day earlier', async () => {
      let createBody: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          await getFixture('post-v1-companies-company_id-payrolls-transition'),
        )
      })
      server.use(handleCreateOffCyclePayroll(createResolver))

      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      const checkDateGroup = screen.getByRole('group', { name: /check date/i })
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /day/i }), '15')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(createResolver).toHaveBeenCalledTimes(1)
      })
      expect(createBody).toMatchObject({
        start_date: START_DATE,
        end_date: END_DATE,
        check_date: '2026-12-15',
        withholding_pay_period: 'Every week',
      })
    })
  })
})
