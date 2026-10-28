import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { TransitionConfiguration } from './TransitionConfiguration'
import { PREPARE_QUERY_KEY } from '@/components/Payroll/PayrollConfiguration/usePayrollConfigurationData'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  handleGetPayroll,
  handlePayrollsPrepare,
  handlePayrollsUpdate,
} from '@/test/mocks/apis/payrolls'
import { handleCreateOffCyclePayroll } from '@/test/mocks/apis/terminations'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { server } from '@/test/mocks/server'

const COMPANY_ID = 'company-123'
const PAYROLL_ID = 'transition-payroll-uuid-1'
const PAY_SCHEDULE_UUID = 'schedule-1'

const buildTransitionPayroll = async (overrides: Record<string, unknown> = {}) => {
  const transitionPayroll = await getFixture('post-v1-companies-company_id-payrolls-transition')
  return {
    ...transitionPayroll,
    pay_period: { ...transitionPayroll.pay_period, pay_schedule_uuid: PAY_SCHEDULE_UUID },
    withholding_pay_period: null,
    skip_regular_deductions: null,
    fixed_withholding_rate: null,
    ...overrides,
  }
}

const buildPreparedTransitionPayroll = (overrides: Record<string, unknown> = {}) =>
  buildTransitionPayroll({
    employee_compensations: [
      { employee_uuid: 'employee-1', version: 'compensation-version-1', excluded: false },
      { employee_uuid: 'employee-2', version: 'compensation-version-2', excluded: false },
    ],
    ...overrides,
  })

describe('TransitionConfiguration', () => {
  const onEvent = vi.fn()

  const renderComponent = () => {
    const queryClient = createSdkQueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GustoTestProvider queryClient={queryClient}>{children}</GustoTestProvider>
    )
    render(
      <TransitionConfiguration companyId={COMPANY_ID} payrollId={PAYROLL_ID} onEvent={onEvent} />,
      { wrapper },
    )
    return { invalidateQueriesSpy }
  }

  const waitForContinueButton = async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })
  }

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
    server.use(
      handleGetPayroll(async () => HttpResponse.json(await buildTransitionPayroll())),
      handlePayrollsPrepare(async () => HttpResponse.json(await buildPreparedTransitionPayroll())),
    )
  })

  it('shows the details read only and defaults unset settings to included deductions and the regular rate at the pay schedule frequency', async () => {
    renderComponent()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /edit transition payroll/i, level: 2 }),
      ).toBeInTheDocument()
    })

    expect(screen.getByText('Aug 14, 2025 - Aug 27, 2025')).toBeInTheDocument()
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    expect(screen.getByText('Payment date')).toBeInTheDocument()
    expect(screen.getByText('Aug 29, 2025')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /payment date/i })).toBeNull()

    expect(
      screen.getByLabelText(/make all the regular deductions and contributions/i),
    ).toBeChecked()
    expect(screen.getAllByText(/regular wages, paid every week/i)).toHaveLength(2)
  })

  it('prepares without employees, saves the settings with one compensation, and emits the updated payroll', async () => {
    let prepareBody: unknown = null
    const prepareResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      prepareBody = await request.json()
      return HttpResponse.json(await buildPreparedTransitionPayroll())
    })
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(await buildPreparedTransitionPayroll({ check_date: '2025-09-02' }))
    })
    const createResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      handlePayrollsPrepare(prepareResolver),
      handlePayrollsUpdate(updateResolver),
      handleCreateOffCyclePayroll(createResolver),
    )

    const user = userEvent.setup()
    const { invalidateQueriesSpy } = renderComponent()
    await waitForContinueButton()

    await user.click(screen.getByLabelText(/block all deductions and contributions/i))
    await user.click(screen.getByRole('button', { name: /edit/i }))
    await waitFor(() => {
      expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText(/use supplemental tax rate/i))
    await user.click(screen.getByRole('button', { name: /done/i, hidden: true }))
    await waitFor(() => {
      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith('transition/configured', {
        payrollUuid: PAYROLL_ID,
        payrollPrepared: expect.objectContaining({
          payrollUuid: PAYROLL_ID,
          checkDate: '2025-09-02',
        }),
      })
    })
    expect(prepareBody).toEqual({})
    expect(updateBody).toMatchObject({
      employee_compensations: [{ employee_uuid: 'employee-1', version: 'compensation-version-1' }],
      skip_regular_deductions: true,
      withholding_pay_period: 'Every week',
      fixed_withholding_rate: true,
    })
    expect(prepareResolver).toHaveBeenCalledBefore(updateResolver)
    expect(createResolver).not.toHaveBeenCalled()
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [PREPARE_QUERY_KEY, PAYROLL_ID] })
    await waitFor(() => {
      expect(screen.getByText('Sep 2, 2025')).toBeInTheDocument()
    })
  })

  it('shows the API error and does not emit transition/configured when the update returns a 422', async () => {
    server.use(
      handlePayrollsUpdate(() =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'base',
                category: 'invalid_operation',
                message: 'Payroll cannot be updated',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderComponent()
    await waitForContinueButton()

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Payroll cannot be updated')).toBeInTheDocument()
    })
    expect(onEvent).not.toHaveBeenCalledWith('transition/configured', expect.anything())
  })

  it('shows an error instead of sending an empty compensation list when prepare returns no employees', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(async () =>
      HttpResponse.json(await buildPreparedTransitionPayroll()),
    )
    server.use(
      handlePayrollsPrepare(async () =>
        HttpResponse.json(await buildPreparedTransitionPayroll({ employee_compensations: [] })),
      ),
      handlePayrollsUpdate(updateResolver),
    )

    const user = userEvent.setup()
    renderComponent()
    await waitForContinueButton()

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText(/no employees to update/i)).toBeInTheDocument()
    })
    expect(updateResolver).not.toHaveBeenCalled()
  })
})
