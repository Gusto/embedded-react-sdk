import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { ConfirmWireDetailsBanner } from './ConfirmWireDetailsBanner'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetWireInRequests,
  createWireInRequest,
  getEmptyWireInRequests,
} from '@/test/mocks/apis/wire_in_requests'
import { handleGetPayrolls, createPayroll } from '@/test/mocks/apis/payrolls'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ConfirmWireDetailsBanner', () => {
  const defaultProps = {
    companyId: 'company-123',
    onStartWireTransfer: vi.fn(),
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    setupApiTestMocks()
    vi.clearAllMocks()
  })

  describe('rendering with no wire requests', () => {
    it('renders nothing when there are no wire requests', async () => {
      server.use(getEmptyWireInRequests)
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })
  })

  describe('with wireInId set', () => {
    it('renders banner with time and date when wireInDeadline is present', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-1',
        wire_in_deadline: '2024-12-15T21:00:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} wireInId="wire-1" />)

      await waitFor(() => {
        expect(
          screen.getByText(/To make payroll, wire funds by 1pm PST on December 15, 2024/),
        ).toBeInTheDocument()
      })
    })

    it('formats deadline with minutes when not on the hour', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-1',
        wire_in_deadline: '2024-12-15T21:30:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} wireInId="wire-1" />)

      await waitFor(() => {
        expect(screen.getByText(/1:30pm pst on December 15, 2024/i)).toBeInTheDocument()
      })
    })

    it('renders nothing when wireInRequest is not found for payrollId', async () => {
      server.use(getEmptyWireInRequests)
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} wireInId="wire-1" />)

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })

    it('correctly displays banner text when wireInId is set but there are multiple wire requests', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        payment_uuid: 'payroll-uuid-2',
      })

      const payroll1 = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
        pay_period: {
          start_date: '2024-12-01',
          end_date: '2024-12-15',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll1])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} wireInId="wire-1" />)

      await waitFor(() => {
        expect(
          screen.getByText(/To make payroll, wire funds by 7am PST on December 15, 2024/i),
        ).toBeInTheDocument()
      })
    })
  })

  describe('with no wireInId set (single wire request)', () => {
    it('renders banner with payroll range when only one wire request exists', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const payroll = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
        pay_period: {
          start_date: '2024-12-01',
          end_date: '2024-12-15',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            /Wire transfer details required for December 1.December 15, 2024 payroll/i,
          ),
        ).toBeInTheDocument()
      })
    })

    it('does not show unordered list for single payroll', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const payroll = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        const lists = screen.queryByRole('list')
        expect(lists).not.toBeInTheDocument()
      })
    })
  })

  describe('multiple payrolls with no wireInId set', () => {
    it('renders banner with count when multiple wire requests exist', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        payment_uuid: 'payroll-uuid-2',
      })

      const payroll1 = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
        pay_period: {
          start_date: '2024-12-01',
          end_date: '2024-12-15',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      const payroll2 = createPayroll({
        payroll_uuid: 'payroll-uuid-2',
        pay_period: {
          start_date: '2024-12-16',
          end_date: '2024-12-31',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll1, payroll2])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(/Wire transfer details required for 2 payrolls/i),
        ).toBeInTheDocument()
      })
    })

    it('renders list of payroll ranges for multiple payrolls', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        payment_uuid: 'payroll-uuid-2',
      })

      const payroll1 = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
        pay_period: {
          start_date: '2024-12-01',
          end_date: '2024-12-15',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      const payroll2 = createPayroll({
        payroll_uuid: 'payroll-uuid-2',
        pay_period: {
          start_date: '2024-12-16',
          end_date: '2024-12-31',
          pay_schedule_uuid: 'schedule-1',
        },
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll1, payroll2])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/December 1.December 15, 2024/i)).toBeInTheDocument()
        expect(screen.getByText(/December 16.December 31, 2024/i)).toBeInTheDocument()
      })
    })

    it('renders unordered list for multiple payrolls', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        payment_uuid: 'payroll-uuid-2',
      })

      const payroll1 = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
      })

      const payroll2 = createPayroll({
        payroll_uuid: 'payroll-uuid-2',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll1, payroll2])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument()
      })
    })
  })

  describe('wire requests without matching payrolls', () => {
    it('handles wire request without matching payroll', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'non-existent-payroll',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<ConfirmWireDetailsBanner {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Wire transfer details required for payroll/i)).toBeInTheDocument()
      })
    })
  })

  describe('button interactions', () => {
    it('calls onStartWireTransfer when button is clicked', async () => {
      const user = userEvent.setup()
      const onStartWireTransfer = vi.fn()

      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        payment_uuid: 'payroll-uuid-1',
      })

      const payroll = createPayroll({
        payroll_uuid: 'payroll-uuid-1',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))
      server.use(handleGetPayrolls(() => HttpResponse.json([payroll])))

      renderWithProviders(
        <ConfirmWireDetailsBanner {...defaultProps} onStartWireTransfer={onStartWireTransfer} />,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Start your wire transfer/i }),
        ).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /Start your wire transfer/i })
      await user.click(button)

      expect(onStartWireTransfer).toHaveBeenCalledTimes(1)
    })
  })
})
