import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayrollHistory, type PayrollHistoryProps } from './PayrollHistory'
import copy from '@/i18n/en/Payroll.PayrollHistory.json'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { ObservabilityProvider } from '@/contexts/ObservabilityProvider/ObservabilityProvider'

const companyId = 'company-123'
const payroll = {
  payroll_uuid: 'payroll-123',
  processed: true,
  off_cycle: false,
  check_date: '2099-01-15',
  payroll_deadline: '2099-01-14T23:30:00Z',
  payroll_status_meta: { cancellable: true },
  pay_period: {
    start_date: '2099-01-01',
    end_date: '2099-01-15',
    pay_schedule_uuid: 'schedule-1',
  },
}

async function openCancellationDialog() {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: /open menu/i }))
  await user.click(screen.getByRole('menuitem', { name: copy.menu.cancelPayroll }))
  return screen.findByRole('button', { name: copy.cancelDialog.primaryAction })
}

describe.each([
  { implementation: 'legacy', unstableFeatures: {} },
  { implementation: 'hooks', unstableFeatures: { payrollHistoryHooks: true } },
])('PayrollHistory public behavior ($implementation)', ({ unstableFeatures }) => {
  function renderComponent(props: Partial<PayrollHistoryProps> = {}) {
    const onEvent = vi.fn()
    const rendered = renderWithProviders(
      <PayrollHistory
        companyId={companyId}
        onEvent={onEvent}
        dictionary={{ en: copy }}
        {...props}
      />,
      { unstableFeatures },
    )
    return { onEvent, ...rendered }
  }

  beforeEach(() => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () =>
        HttpResponse.json([payroll]),
      ),
      http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, () =>
        HttpResponse.json([]),
      ),
    )
  })

  it('renders dictionary overrides and custom className', async () => {
    const { container } = renderComponent({
      className: 'payroll-history-review',
      dictionary: { en: { title: 'Completed payments', dateFilter: { trigger: 'Choose dates' } } },
    })
    expect(await screen.findByRole('heading', { name: 'Completed payments' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Choose dates' })).toBeEnabled()
    expect(container.querySelector('.payroll-history-review')).toBeInTheDocument()
  })

  it('shows a custom loader until payroll data is ready', async () => {
    let release: (() => void) | undefined
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, async () => {
        await new Promise<void>(resolve => {
          release = resolve
        })
        return HttpResponse.json([payroll])
      }),
    )
    renderComponent({ LoaderComponent: () => <div role="status">Loading payroll history</div> })
    expect(await screen.findByText('Loading payroll history')).toBeInTheDocument()
    await waitFor(() => {
      expect(release).toBeTypeOf('function')
    })
    release?.()
    expect(await screen.findByRole('heading', { name: copy.title })).toBeInTheDocument()
  })

  it.each(['payrolls', 'wire_in_requests'] as const)(
    'emits the raw %s query error and supports retry through its custom fallback',
    async endpoint => {
      const resolver = vi.fn<HttpResponseResolver>(() => new HttpResponse(null, { status: 500 }))
      server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id/${endpoint}`, resolver))
      const { onEvent } = renderComponent({
        FallbackComponent: ({ resetErrorBoundary }: FallbackProps) => (
          <button onClick={resetErrorBoundary}>Retry payroll history</button>
        ),
      })
      await screen.findByRole('button', { name: 'Retry payroll history' })
      expect(onEvent).toHaveBeenCalledWith(componentEvents.ERROR, expect.any(Error))
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/${endpoint}`, () =>
          HttpResponse.json(endpoint === 'payrolls' ? [payroll] : []),
        ),
      )
      await userEvent.click(screen.getByRole('button', { name: 'Retry payroll history' }))
      expect(await screen.findByRole('heading', { name: copy.title })).toBeInTheDocument()
    },
  )

  it('routes a thrown cancellation event callback to the applicable boundary and records a failed submit', async () => {
    const callbackError = new Error('Cancellation callback failed')
    const onEvent = vi.fn<PayrollHistoryProps['onEvent']>(event => {
      if (event === componentEvents.RUN_PAYROLL_CANCELLED) {
        throw callbackError
      }
    })
    const onMetric = vi.fn()
    const onBoundaryError = vi.fn()
    const resolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ ...payroll, processed: false }),
    )
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, resolver),
    )
    renderWithProviders(
      <ObservabilityProvider observability={{ onMetric }}>
        <ErrorBoundary
          onError={onBoundaryError}
          fallbackRender={({ error }: FallbackProps) => (
            <div role="alert">{(error as Error).message}</div>
          )}
        >
          <PayrollHistory
            companyId={companyId}
            dictionary={{ en: copy }}
            onEvent={onEvent}
            FallbackComponent={({ error }: FallbackProps) => (
              <div role="alert">{(error as Error).message}</div>
            )}
          />
        </ErrorBoundary>
      </ObservabilityProvider>,
      { unstableFeatures },
    )
    await userEvent.click(await openCancellationDialog())
    expect(await screen.findByRole('alert')).toHaveTextContent(callbackError.message)
    expect(resolver).toHaveBeenCalledTimes(1)
    if (unstableFeatures.payrollHistoryHooks) {
      expect(onBoundaryError.mock.calls).toEqual([])
      expect(onEvent).toHaveBeenCalledWith(componentEvents.ERROR, callbackError)
    } else {
      expect(onBoundaryError).toHaveBeenCalledWith(callbackError, expect.any(Object))
      expect(onEvent.mock.calls.map(([event]) => event)).toEqual([
        componentEvents.RUN_PAYROLL_CANCELLED,
      ])
    }
    expect(onMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'sdk.form.submit_duration',
        tags: expect.objectContaining({ status: 'error' }),
      }),
    )
  })

  it('keeps cancellation pending and emits the complete API result before closing the dialog', async () => {
    let release: (() => void) | undefined
    let requestPath: string | undefined
    const resolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestPath = new URL(request.url).pathname
      await new Promise<void>(resolve => {
        release = resolve
      })
      return HttpResponse.json({ ...payroll, processed: false })
    })
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, resolver),
    )
    const { onEvent } = renderComponent()
    const confirmButton = await openCancellationDialog()
    await userEvent.click(confirmButton)
    await waitFor(() => {
      expect(resolver).toHaveBeenCalledTimes(1)
    })
    expect(confirmButton).toBeDisabled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onEvent.mock.calls).toEqual([])
    expect(requestPath).toBe(`/v1/companies/${companyId}/payrolls/${payroll.payroll_uuid}/cancel`)
    release?.()
    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_CANCELLED, {
        payrollId: payroll.payroll_uuid,
        result: expect.objectContaining({
          unprocessedPayroll: expect.objectContaining({
            payrollUuid: payroll.payroll_uuid,
            processed: false,
          }),
          httpMeta: expect.objectContaining({
            response: expect.any(Response),
            request: expect.any(Request),
          }),
        }),
      })
      expect(screen.queryAllByRole('dialog')).toHaveLength(0)
    })
  })

  it('closes cancellation on API failure, shows inline errors, and permits another attempt', async () => {
    const resolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(
        {
          errors: [
            {
              error_key: 'payroll',
              category: 'not_found',
              message: 'Payroll is no longer available',
            },
          ],
        },
        { status: 404 },
      ),
    )
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, resolver),
    )
    const { onEvent } = renderComponent()
    await userEvent.click(await openCancellationDialog())
    expect(await screen.findByText('Payroll is no longer available')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryAllByRole('dialog')).toHaveLength(0)
    })
    expect(onEvent.mock.calls).toEqual([])
    expect(await openCancellationDialog()).toBeEnabled()
  })

  it('retains cached wire data when a background refetch fails after successful cancellation', async () => {
    let wireRequestCount = 0
    const wireResolver = vi.fn<HttpResponseResolver>(() => {
      wireRequestCount += 1
      return wireRequestCount === 1
        ? HttpResponse.json([])
        : new HttpResponse(null, { status: 500 })
    })
    const cancelResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ ...payroll, processed: false }),
    )
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, wireResolver),
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`,
        cancelResolver,
      ),
    )
    const { onEvent } = renderComponent({
      FallbackComponent: () => <div>Payroll history query failed</div>,
    })
    await userEvent.click(await openCancellationDialog())
    await waitFor(() => {
      expect(wireResolver).toHaveBeenCalledTimes(2)
      expect(onEvent.mock.calls).toEqual([
        [
          componentEvents.RUN_PAYROLL_CANCELLED,
          expect.objectContaining({
            payrollId: payroll.payroll_uuid,
            result: expect.objectContaining({
              unprocessedPayroll: expect.objectContaining({
                payrollUuid: payroll.payroll_uuid,
                processed: false,
              }),
            }),
          }),
        ],
      ])
    })
    expect(await screen.findByRole('heading', { name: copy.title })).toBeVisible()
    expect(screen.queryAllByText('Payroll history query failed')).toHaveLength(0)
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(cancelResolver).toHaveBeenCalledTimes(1)
  })

  it('resets pagination and restores initial dates when the cleared filter is applied', async () => {
    const urls: URL[] = []
    const resolver = vi.fn<HttpResponseResolver>(({ request }) => {
      urls.push(new URL(request.url))
      return HttpResponse.json([payroll], {
        headers: { 'x-total-pages': '3', 'x-total-count': '15' },
      })
    })
    server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, resolver))
    renderComponent()
    const user = userEvent.setup()
    await user.click(await screen.findByTestId('pagination-next'))
    await waitFor(() => {
      expect(urls.at(-1)?.searchParams.get('page')).toBe('2')
    })
    await user.click(await screen.findByRole('button', { name: copy.dateFilter.trigger }))
    await user.click(await screen.findByRole('button', { name: copy.dateFilter.reset }))
    await user.click(screen.getByRole('button', { name: copy.dateFilter.apply }))
    await waitFor(() => {
      expect(urls.at(-1)?.searchParams.get('page')).toBe('1')
      expect(urls.at(-1)?.searchParams.get('start_date')).toBe(
        urls[0]?.searchParams.get('start_date'),
      )
      expect(urls.at(-1)?.searchParams.get('end_date')).toBe(urls[0]?.searchParams.get('end_date'))
    })
  })
})
