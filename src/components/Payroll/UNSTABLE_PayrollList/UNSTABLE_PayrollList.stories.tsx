import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { expect, fn, userEvent, within } from 'storybook/test'
import { UNSTABLE_PayrollList } from './UNSTABLE_PayrollList'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'

export default { title: 'Domain/Payroll/UNSTABLE_PayrollList' }

const onEvent = fn().mockName('onEvent')

type Scenario = 'default' | 'empty' | 'loading' | 'error' | 'paginated' | 'skip' | 'delete'

const dateInDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const createPayroll = (id: string, overrides: Record<string, unknown> = {}) => ({
  payroll_uuid: id,
  processed: false,
  off_cycle: false,
  external: false,
  check_date: dateInDays(7),
  payroll_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  pay_period: {
    start_date: dateInDays(-14),
    end_date: dateInDays(0),
    pay_schedule_uuid: 'schedule-1',
  },
  ...overrides,
})

const paySchedules = [
  {
    uuid: 'schedule-1',
    frequency: 'Every other week',
    anchor_pay_date: '2024-01-05',
    anchor_end_of_pay_period: '2024-01-01',
    custom_name: 'Bi-weekly',
    active: true,
    version: 'schedule-version-1',
  },
]

function createRows(scenario: Scenario) {
  if (scenario === 'empty') return []
  if (scenario === 'delete') {
    return [createPayroll('bonus-1', { off_cycle: true, off_cycle_reason: 'Bonus' })]
  }
  if (scenario === 'paginated') {
    return Array.from({ length: 12 }, (_, index) =>
      createPayroll(`payroll-${index + 1}`, {
        pay_period: {
          start_date: dateInDays(-14 - index * 14),
          end_date: dateInDays(-index * 14),
          pay_schedule_uuid: 'schedule-1',
        },
      }),
    )
  }
  return [
    createPayroll('regular-1'),
    createPayroll('calculated-1', { calculated_at: new Date().toISOString() }),
    createPayroll('bonus-1', { off_cycle: true, off_cycle_reason: 'Bonus' }),
  ]
}

function MockPayrollList({ scenario }: { scenario: Scenario }) {
  const { queryClient, client } = useMemo(() => {
    let rows = createRows(scenario)
    const queryClient = createSdkQueryClient()
    const client = new GustoEmbeddedCore({
      serverURL: 'https://payroll-list.storybook.invalid',
      httpClient: new HTTPClient({
        fetcher: async input => {
          const request = input instanceof Request ? input : new Request(input)
          const url = new URL(request.url)
          if (scenario === 'loading') return new Promise<Response>(() => {})
          if (scenario === 'error')
            return Response.json({ message: 'Unable to load payrolls' }, { status: 500 })
          if (request.method === 'POST' && url.pathname.endsWith('/payrolls/skip')) {
            rows = rows.slice(1)
            return new Response(null, { status: 202 })
          }
          if (request.method === 'DELETE') {
            rows = []
            return new Response(null, { status: 204 })
          }
          if (url.pathname.endsWith('/payrolls')) {
            const page = Number(url.searchParams.get('page') ?? 1)
            const per = Number(url.searchParams.get('per') ?? 5)
            return Response.json(rows.slice((page - 1) * per, page * per), {
              headers: {
                'x-total-count': String(rows.length),
                'x-total-count-pages': String(Math.ceil(rows.length / per)),
                'x-total-pages': String(Math.ceil(rows.length / per)),
              },
            })
          }
          if (url.pathname.endsWith('/pay_schedules')) return Response.json(paySchedules)
          if (url.pathname.endsWith('/payrolls/blockers')) return Response.json([])
          if (url.pathname.endsWith('/wire_in_requests')) return Response.json([])
          if (url.pathname.endsWith('/pay_periods')) return Response.json([])
          throw new Error(`Unexpected Storybook request: ${request.method} ${url.pathname}`)
        },
      }),
    })
    return { queryClient, client }
  }, [scenario])

  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={client}>
        <UNSTABLE_PayrollList companyId="company-1" onEvent={onEvent} />
      </GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}

export const PayrollListStory = () => <MockPayrollList scenario="default" />
export const EmptyState = () => <MockPayrollList scenario="empty" />
export const Loading = () => <MockPayrollList scenario="loading" />
export const QueryError = () => <MockPayrollList scenario="error" />
export const Paginated = () => <MockPayrollList scenario="paginated" />

export const SkipPayroll = {
  render: () => <MockPayrollList scenario="skip" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click((await canvas.findAllByRole('button', { name: /open menu/i }))[0]!)
    await userEvent.click(await body.findByRole('menuitem', { name: 'Skip payroll' }))
    await userEvent.click(await body.findByRole('button', { name: 'Yes, skip payroll' }))
    await expect(canvas.findByText('Payroll skipped')).resolves.toBeVisible()
  },
}

export const DeletePayroll = {
  render: () => <MockPayrollList scenario="delete" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: /open menu/i }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'Cancel payroll' }))
    await userEvent.click(await body.findByRole('button', { name: 'Yes, cancel payroll' }))
    await expect(canvas.findByText('Payroll cancelled')).resolves.toBeVisible()
  },
}
