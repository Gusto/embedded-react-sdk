import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { WireInstructions } from './WireInstructions'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { payrollWireEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { handleGetWireInRequests, createWireInRequest } from '@/test/mocks/apis/wire_in_requests'
import { FlowContext } from '@/components/Flow/useFlow'

describe('WireInstructions', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  const renderWithFooter = (props: typeof defaultProps) => {
    const flowContextValue = {
      component: null,
      onEvent: props.onEvent,
      companyId: props.companyId,
      wireInId: undefined,
    }

    return renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <Suspense fallback={<div>Loading...</div>}>
          <WireInstructions {...props} />
          <WireInstructions.Footer onEvent={props.onEvent} />
        </Suspense>
      </FlowContext.Provider>,
    )
  }

  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('rendering with no wire instructions', () => {
    it('renders empty state when no wire requests are available', async () => {
      server.use(handleGetWireInRequests(() => HttpResponse.json([])))

      renderWithFooter(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('No wire instructions available at this time.')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /confirm|done/i })).not.toBeInTheDocument()
    })

    it('calls onEvent with cancel event when close is clicked in empty state', async () => {
      const user = userEvent.setup()
      server.use(handleGetWireInRequests(() => HttpResponse.json([])))

      renderWithFooter(defaultProps)

      await waitFor(() => {
        expect(screen.getByText('No wire instructions available at this time.')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL,
      )
    })
  })

  describe('rendering with single wire instruction', () => {
    it('renders wire instruction details correctly', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        unique_tracking_code: 'TRACK123456',
        requested_amount: '5000.00',
        origination_bank: 'Test Bank',
        origination_bank_address: '123 Bank St, San Francisco, CA 94111',
        recipient_name: 'Gusto, Inc.',
        recipient_address: '525 20th Street, San Francisco, CA 94107',
        recipient_account_number: '1234567890',
        recipient_routing_number: '121000248',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Wire instructions')).toBeInTheDocument()
      })

      expect(screen.getByText('TRACK123456')).toBeInTheDocument()
      expect(screen.getByText('$5,000.00')).toBeInTheDocument()
      expect(screen.getByText('Test Bank')).toBeInTheDocument()
      expect(screen.getByText('123 Bank St, San Francisco, CA 94111')).toBeInTheDocument()
      expect(screen.getByText('Gusto, Inc.')).toBeInTheDocument()
      expect(screen.getByText('525 20th Street, San Francisco, CA 94107')).toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
      expect(screen.getByText('121000248')).toBeInTheDocument()
    })

    it('renders requirements alert with list items', async () => {
      const wireInRequest = createWireInRequest({ status: 'awaiting_funds' })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('What to know when wiring funds')).toBeInTheDocument()
      })

      expect(
        screen.getByText(/You must include the unique tracking code from the wire instructions/),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The amount you send must exactly match the amount/),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The originating bank account must be based in the US/),
      ).toBeInTheDocument()
      expect(screen.getByText(/You must be authorized to use the bank account/)).toBeInTheDocument()
    })

    it('does not render dropdown when only one wire request exists', async () => {
      const wireInRequest = createWireInRequest({ status: 'awaiting_funds' })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Wire instructions')).toBeInTheDocument()
      })

      expect(screen.queryByLabelText(/Wire transfer for payroll/i)).not.toBeInTheDocument()
    })
  })

  describe('rendering with multiple wire instructions', () => {
    it('renders dropdown when multiple wire requests exist', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-15T15:00:00Z',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-20T15:00:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Wire transfer for payroll/i }),
        ).toBeInTheDocument()
      })
    })

    it('allows selecting different wire instructions from dropdown', async () => {
      const user = userEvent.setup()
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        unique_tracking_code: 'TRACK111',
        wire_in_deadline: '2024-12-15T15:00:00Z',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
        unique_tracking_code: 'TRACK222',
        wire_in_deadline: '2024-12-20T15:00:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('TRACK111')).toBeInTheDocument()
      })

      const selectButton = screen.getByRole('button', { name: /Wire transfer for payroll/i })
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const options = screen.getAllByRole('option')
      await user.click(options[1]!)

      await waitFor(() => {
        expect(screen.getByText('TRACK222')).toBeInTheDocument()
      })

      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT,
        { selectedId: 'wire-2' },
      )
    })

    it('does not render dropdown when wireInId is provided', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(<WireInstructions {...defaultProps} wireInId="wire-1" />)

      await waitFor(() => {
        expect(screen.getByText('Wire instructions')).toBeInTheDocument()
      })

      expect(screen.queryByLabelText(/Wire transfer for payroll/i)).not.toBeInTheDocument()
    })
  })

  describe('filtering by wireInId', () => {
    it('displays only the specified wire request when wireInId is provided', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        unique_tracking_code: 'TRACK111',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
        unique_tracking_code: 'TRACK222',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(<WireInstructions {...defaultProps} wireInId="wire-2" />)

      await waitFor(() => {
        expect(screen.getByText('TRACK222')).toBeInTheDocument()
      })

      expect(screen.queryByText('TRACK111')).not.toBeInTheDocument()
    })

    it('renders empty state when wireInId does not match any awaiting_funds request', async () => {
      const wireInRequest = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} wireInId="non-existent" />)

      await waitFor(() => {
        expect(screen.getByText('No wire instructions available at this time.')).toBeInTheDocument()
      })
    })
  })

  describe('date formatting', () => {
    it('formats wire deadline date correctly in dropdown options', async () => {
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-15T15:00:00Z',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-20T15:00:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Wire transfer for payroll/i }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('currency formatting', () => {
    it('formats currency amounts correctly', async () => {
      const wireInRequest = createWireInRequest({
        status: 'awaiting_funds',
        requested_amount: '12345.67',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('$12,345.67')).toBeInTheDocument()
      })
    })

    it('handles zero amounts correctly', async () => {
      const wireInRequest = createWireInRequest({
        status: 'awaiting_funds',
        requested_amount: '0',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('has proper heading structure', async () => {
      const wireInRequest = createWireInRequest({ status: 'awaiting_funds' })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest])))

      renderWithProviders(<WireInstructions {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Wire instructions' })).toBeInTheDocument()
      })
    })
  })

  describe('modal container ref', () => {
    it('passes modalContainerRef to Select component', async () => {
      const modalContainerRef = { current: document.createElement('div') }
      const wireInRequest1 = createWireInRequest({
        uuid: 'wire-1',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-15T15:00:00Z',
      })
      const wireInRequest2 = createWireInRequest({
        uuid: 'wire-2',
        status: 'awaiting_funds',
        wire_in_deadline: '2024-12-20T15:00:00Z',
      })

      server.use(handleGetWireInRequests(() => HttpResponse.json([wireInRequest1, wireInRequest2])))

      renderWithProviders(
        <WireInstructions {...defaultProps} modalContainerRef={modalContainerRef} />,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Wire transfer for payroll/i }),
        ).toBeInTheDocument()
      })
    })
  })
})
