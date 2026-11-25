import { useState, useCallback, useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { expect, fn, userEvent, within } from 'storybook/test'
import { PayrollList } from './PayrollList'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { addDays, formatDateToStringDate } from '@/helpers/dateFormatting'

export default {
  title: 'Domain/Payroll/PayrollList',
}

const runPayrollAction = fn().mockName('run_payroll')
const submitPayrollAction = fn().mockName('submit_payroll')
const skipPayrollAction = fn().mockName('skip_payroll')
const deletePayrollAction = fn().mockName('delete_payroll')
const runOffCyclePayrollAction = fn().mockName('run_off_cycle_payroll')
const dismissAlertAction = fn().mockName('dismiss_alert')

const mockDateRangeFilter: UseDateRangeFilterResult = {
  startDate: null,
  endDate: null,
  isModified: false,
  handleStartDateChange: fn().mockName('handleStartDateChange'),
  handleEndDateChange: fn().mockName('handleEndDateChange'),
  handleClearFilter: fn().mockName('handleClearFilter'),
  getApiDateParams: () => ({}),
  getMaxEndDate: () => undefined,
  getMinStartDate: () => undefined,
}

export const PayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const EmptyPayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[]}
      paySchedules={[]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithSkipAlertStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={true}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListSkippingStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId="abcd"
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithBlockersStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[{ key: 'signatory_required', message: 'Signatory required' }]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const NoKebabActionsAvailable = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 7)
  const futureStartDate = tomorrow.toISOString().split('T')[0]

  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'no-skip-1',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: futureStartDate,
            endDate: '2025-12-31',
          },
        },
        {
          checkDate: '2025-12-20',
          payrollDeadline: new Date(),
          payrollUuid: 'no-skip-future-2',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: futureStartDate,
            endDate: '2025-12-31',
          },
        },
        {
          checkDate: '2025-12-25',
          payrollDeadline: new Date(),
          payrollUuid: 'no-skip-2',
          offCycle: true,
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: futureStartDate,
            endDate: '2025-12-31',
          },
        },
        {
          checkDate: '2025-12-30',
          payrollDeadline: new Date(),
          payrollUuid: 'processed-1',
          processed: true,
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-01-01',
            endDate: '2025-01-13',
          },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Bi-weekly' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithWireInStatusesStory = () => {
  const futureDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000)
  const nearDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const farDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-20',
          payrollDeadline: futureDeadline,
          payrollUuid: 'wire-1',
          processed: true,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
        {
          checkDate: '2025-12-22',
          payrollDeadline: futureDeadline,
          payrollUuid: 'wire-2',
          processed: true,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-14', endDate: '2025-01-27' },
        },
        {
          checkDate: '2025-12-25',
          payrollDeadline: nearDeadline,
          payrollUuid: 'deadline-1',
          processed: false,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-28', endDate: '2025-02-10' },
        },
        {
          checkDate: '2025-12-30',
          payrollDeadline: farDeadline,
          payrollUuid: 'deadline-2',
          processed: false,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-02-11', endDate: '2025-02-24' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Bi-weekly' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[
        {
          uuid: 'wire-req-1',
          status: 'awaiting_funds',
          paymentUuid: 'wire-1',
          wireInDeadline: futureDeadline.toISOString(),
        },
        {
          uuid: 'wire-req-2',
          status: 'pending_review',
          paymentUuid: 'wire-2',
          wireInDeadline: futureDeadline.toISOString(),
        },
      ]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithMixedTypesStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-08-24',
          payrollDeadline: new Date(Date.now() + 16 * 60 * 60 * 1000),
          payrollUuid: 'regular-1',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-13',
            endDate: '2025-08-27',
          },
        },
        {
          checkDate: '2025-09-08',
          payrollDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          payrollUuid: 'regular-2',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-27',
            endDate: '2025-09-10',
          },
        },
        {
          checkDate: '2025-08-20',
          payrollDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          payrollUuid: 'offcycle-1',
          offCycle: true,
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-15',
            endDate: '2025-08-20',
          },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Engineering staff' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const WithDateFilter = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date('2025-01-01'))
  const [endDate, setEndDate] = useState<Date | null>(new Date('2025-06-30'))

  const handleClear = useCallback(() => {
    setStartDate(null)
    setEndDate(null)
  }, [])

  const activeDateRangeFilter: UseDateRangeFilterResult = {
    startDate,
    endDate,
    isModified: startDate !== null || endDate !== null,
    handleStartDateChange: setStartDate,
    handleEndDateChange: setEndDate,
    handleClearFilter: handleClear,
    getApiDateParams: () => ({
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    }),
    getMaxEndDate: () =>
      startDate ? new Date(new Date(startDate).setMonth(startDate.getMonth() + 12)) : undefined,
    getMinStartDate: () =>
      endDate ? new Date(new Date(endDate).setMonth(endDate.getMonth() - 12)) : undefined,
  }

  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-03-15',
          payrollDeadline: new Date(),
          payrollUuid: 'filtered-1',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-03-01', endDate: '2025-03-14' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Bi-weekly' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={activeDateRangeFilter}
    />
  )
}

/*
 * Connected stories render `PayrollList` itself against a mock transport, so they exercise
 * `usePayrollList` — fetching, filters, pagination, skip, and delete — alongside the
 * presentation-only stories above.
 */

const onEvent = fn().mockName('onEvent')

type ConnectedScenario = 'default' | 'empty' | 'loading' | 'error' | 'paginated' | 'skip' | 'delete'

const dateInDays = (days: number) => formatDateToStringDate(addDays(new Date(), days)) ?? ''

const createConnectedPayroll = (id: string, overrides: Record<string, unknown> = {}) => ({
  payroll_uuid: id,
  processed: false,
  off_cycle: false,
  external: false,
  check_date: dateInDays(7),
  payroll_deadline: addDays(new Date(), 5).toISOString(),
  pay_period: {
    start_date: dateInDays(-14),
    end_date: dateInDays(0),
    pay_schedule_uuid: 'schedule-1',
  },
  ...overrides,
})

const connectedPaySchedules = [
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

function createConnectedRows(scenario: ConnectedScenario) {
  if (scenario === 'empty') return []
  if (scenario === 'delete') {
    return [createConnectedPayroll('bonus-1', { off_cycle: true, off_cycle_reason: 'Bonus' })]
  }
  if (scenario === 'paginated') {
    return Array.from({ length: 12 }, (_, index) =>
      createConnectedPayroll(`payroll-${index + 1}`, {
        pay_period: {
          start_date: dateInDays(-14 - index * 14),
          end_date: dateInDays(-index * 14),
          pay_schedule_uuid: 'schedule-1',
        },
      }),
    )
  }
  return [
    createConnectedPayroll('regular-1'),
    createConnectedPayroll('calculated-1', { calculated_at: new Date().toISOString() }),
    createConnectedPayroll('bonus-1', { off_cycle: true, off_cycle_reason: 'Bonus' }),
  ]
}

function ConnectedPayrollList({ scenario }: { scenario: ConnectedScenario }) {
  const { queryClient, client } = useMemo(() => {
    let rows = createConnectedRows(scenario)
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
          if (url.pathname.endsWith('/pay_schedules')) return Response.json(connectedPaySchedules)
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
        <PayrollList companyId="company-1" onEvent={onEvent} />
      </GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}

export const Connected = () => <ConnectedPayrollList scenario="default" />
export const ConnectedEmptyState = () => <ConnectedPayrollList scenario="empty" />
export const ConnectedLoading = () => <ConnectedPayrollList scenario="loading" />
export const ConnectedQueryError = () => <ConnectedPayrollList scenario="error" />
export const ConnectedPaginated = () => <ConnectedPayrollList scenario="paginated" />

export const ConnectedSkipPayroll = {
  render: () => <ConnectedPayrollList scenario="skip" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const menus = await canvas.findAllByRole('button', { name: /open menu/i })
    const [firstMenu] = menus
    if (!firstMenu) throw new Error('No row menu rendered')
    await userEvent.click(firstMenu)
    await userEvent.click(await body.findByRole('menuitem', { name: 'Skip payroll' }))
    await userEvent.click(await body.findByRole('button', { name: 'Yes, skip payroll' }))
    await expect(canvas.findByText('Payroll skipped')).resolves.toBeVisible()
  },
}

export const ConnectedDeletePayroll = {
  render: () => <ConnectedPayrollList scenario="delete" />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: /open menu/i }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'Cancel payroll' }))
    await userEvent.click(await body.findByRole('button', { name: 'Yes, cancel payroll' }))
    await expect(canvas.findByText('Payroll cancelled')).resolves.toBeVisible()
  },
}
