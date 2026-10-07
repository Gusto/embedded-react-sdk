import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { UNSTABLE_PayrollHistory } from './UNSTABLE_PayrollHistory'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'

export default { title: 'Domain/Payroll/UNSTABLE_PayrollHistory' }

const onEvent = fn().mockName('onEvent')
type Scenario =
  | 'default'
  | 'all-statuses'
  | 'cancel-dialog'
  | 'date-filter'
  | 'loading'
  | 'error'
  | 'empty'
  | 'cancel-error'
  | 'paginated'

function createScenarioData(scenario: Scenario) {
  const now = Date.now()
  const dateInDays = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString()
  const createPayroll = (
    id: string,
    periodOffset: number,
    overrides: Record<string, unknown> = {},
  ) => ({
    payroll_uuid: id,
    processed: false,
    check_date: dateInDays(1),
    external: false,
    off_cycle: false,
    payroll_deadline: dateInDays(2),
    payroll_status_meta: {
      cancellable: true,
      expected_check_date: dateInDays(1).slice(0, 10),
      initial_check_date: dateInDays(1).slice(0, 10),
      expected_debit_time: dateInDays(2),
      payroll_late: false,
      initial_debit_cutoff_time: dateInDays(2),
    },
    pay_period: {
      start_date: dateInDays(periodOffset - 14).slice(0, 10),
      end_date: dateInDays(periodOffset).slice(0, 10),
      pay_schedule_uuid: 'schedule-1',
    },
    totals: { net_pay: '30198.76', gross_pay: '38000.00' },
    ...overrides,
  })
  const history = [
    createPayroll('1', -31, { processed: true, check_date: dateInDays(-5) }),
    createPayroll('2', -16, { processed: true, check_date: dateInDays(3) }),
    createPayroll('3', -1, {
      calculated_at: new Date(now).toISOString(),
      processing_request: { status: 'calculate_success' },
    }),
  ]
  if (scenario === 'empty') return { rows: [], wires: [] }
  if (scenario === 'cancel-dialog' || scenario === 'cancel-error') {
    return { rows: [createPayroll('cancel-dialog', -1, { processed: true })], wires: [] }
  }
  if (scenario === 'all-statuses') {
    return {
      rows: [
        createPayroll('calculating', -151, { processing_request: { status: 'calculating' } }),
        createPayroll('ready-to-submit', -136, {
          calculated_at: new Date(now).toISOString(),
          processing_request: { status: 'calculate_success' },
        }),
        createPayroll('processing', -121, { processing_request: { status: 'submitting' } }),
        createPayroll('failed', -106, { processing_request: { status: 'processing_failed' } }),
        createPayroll('waiting-wire-in', -91, { processed: true, check_date: dateInDays(7) }),
        createPayroll('pending-approval', -76, { processed: true, check_date: dateInDays(7) }),
        createPayroll('due-in-hours', -61, {
          payroll_deadline: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
        }),
        createPayroll('due-in-days', -46, { payroll_deadline: dateInDays(8) }),
        createPayroll('days-late', -31, { payroll_deadline: dateInDays(-2) }),
        createPayroll('paid', -16, { processed: true, check_date: dateInDays(-10) }),
        createPayroll('pending', -1, { processed: true, check_date: dateInDays(7) }),
      ],
      wires: [
        { status: 'awaiting_funds', payment_uuid: 'waiting-wire-in' },
        { status: 'pending_review', payment_uuid: 'pending-approval' },
      ],
    }
  }
  if (scenario === 'paginated') {
    return {
      rows: Array.from({ length: 12 }, (_, index) =>
        createPayroll(`payroll-${index + 1}`, -1 - index * 14, {
          processed: true,
          check_date: dateInDays(-index),
        }),
      ),
      wires: [],
    }
  }
  return { rows: history, wires: [{ status: 'awaiting_funds', payment_uuid: '2' }] }
}

function MockPayrollHistory({ scenario }: { scenario: Scenario }) {
  const { queryClient, client } = useMemo(() => {
    const data = createScenarioData(scenario)
    let rows = data.rows
    const queryClient = createSdkQueryClient()
    const client = new GustoEmbeddedCore({
      serverURL: 'https://payroll-history.storybook.invalid',
      httpClient: new HTTPClient({
        fetcher: async input => {
          const request = input instanceof Request ? input : new Request(input)
          const url = new URL(request.url)
          if (scenario === 'loading') return new Promise<Response>(() => {})
          if (scenario === 'error')
            return Response.json({ message: 'Unable to load payroll history' }, { status: 500 })
          if (request.method === 'PUT' && url.pathname.endsWith('/cancel')) {
            if (scenario === 'cancel-error')
              return Response.json({ error: 'Cancellation failed' }, { status: 400 })
            const payrollId = url.pathname.split('/').at(-2)
            const payroll = rows.find(row => row.payroll_uuid === payrollId)
            rows = rows.filter(row => row.payroll_uuid !== payrollId)
            return Response.json({ ...payroll, processed: false })
          }
          if (url.pathname.endsWith('/payrolls')) {
            const page = Number(url.searchParams.get('page') ?? 1)
            const per = Number(url.searchParams.get('per') ?? 5)
            const startDate = url.searchParams.get('start_date')
            const endDate = url.searchParams.get('end_date')
            const filteredRows =
              scenario === 'date-filter'
                ? rows.filter(
                    row =>
                      (!startDate || row.pay_period.start_date >= startDate) &&
                      (!endDate || row.pay_period.end_date <= endDate),
                  )
                : rows
            return Response.json(filteredRows.slice((page - 1) * per, page * per), {
              headers: {
                'x-total-count': String(filteredRows.length),
                'x-total-pages': String(Math.ceil(filteredRows.length / per)),
              },
            })
          }
          if (url.pathname.endsWith('/wire_in_requests')) return Response.json(data.wires)
          throw new globalThis.Error(
            `Unexpected Storybook request: ${request.method} ${url.pathname}`,
          )
        },
      }),
    })
    return { queryClient, client }
  }, [scenario])

  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={client}>
        <UNSTABLE_PayrollHistory companyId="company-1" onEvent={onEvent} />
      </GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}

export const Default = () => <MockPayrollHistory scenario="default" />
export const Loading = () => <MockPayrollHistory scenario="loading" />
export const Error = () => <MockPayrollHistory scenario="error" />
export const Empty = () => <MockPayrollHistory scenario="empty" />
export const CancellationError = () => <MockPayrollHistory scenario="cancel-error" />
export const Paginated = () => <MockPayrollHistory scenario="paginated" />

export const PayrollHistoryStory = () => <MockPayrollHistory scenario="default" />
export const EmptyState = () => <MockPayrollHistory scenario="empty" />
export const AllStatusesShowcase = {
  render: () => <MockPayrollHistory scenario="all-statuses" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Calculating...')
    await userEvent.click(canvas.getByRole('button', { name: /Items per page/ }))
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole('option', { name: '25' }),
    )
    await userEvent.keyboard('{Escape}')
    await expect(canvas.findByText('Complete')).resolves.toBeVisible()
  },
}
export const CancelDialog = {
  render: () => <MockPayrollHistory scenario="cancel-dialog" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Payroll history' })
    await userEvent.click(await canvas.findByRole('button', { name: 'Open menu' }))
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('menuitem', {
        name: 'Cancel payroll',
      }),
    )
    await expect(
      within(canvasElement.ownerDocument.body).findByRole('button', {
        name: 'Yes, cancel payroll',
      }),
    ).resolves.toBeVisible()
  },
}
export const WithDateFilter = {
  render: () => <MockPayrollHistory scenario="date-filter" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Payroll history' })
    await userEvent.click(canvas.getByRole('button', { name: 'Filter by date' }))
    const body = within(canvasElement.ownerDocument.body)
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const segments = [
      ['month', startDate.getMonth() + 1],
      ['day', startDate.getDate()],
      ['year', startDate.getFullYear()],
    ] as const
    for (const [segment, value] of segments) {
      await userEvent.click(
        await body.findByRole('spinbutton', { name: new RegExp(`${segment}, Start Date`) }),
      )
      await userEvent.keyboard(`{Control>}a{/Control}${value}`)
    }
    await userEvent.click(body.getByRole('button', { name: 'Apply' }))
    await expect(canvas.findByText('Waiting for wire in')).resolves.toBeVisible()
    await expect(canvas.findByText('Ready to submit')).resolves.toBeVisible()
    await waitFor(() => expect(canvas.queryByText('Complete')).not.toBeInTheDocument())
  },
}
