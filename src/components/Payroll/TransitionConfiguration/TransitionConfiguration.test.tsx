import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  COMPANY_ID,
  PAYROLL_ID,
  buildPreparedTransitionPayroll,
  buildTransitionPayroll,
} from './__fixtures__/transitionConfigurationMocks'
import { TransitionConfiguration } from './TransitionConfiguration'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  handleGetPayroll,
  handlePayrollsPrepare,
  handlePayrollsUpdate,
} from '@/test/mocks/apis/payrolls'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('TransitionConfiguration', () => {
  const onEvent = vi.fn()

  const renderComponent = () =>
    renderWithProviders(
      <TransitionConfiguration companyId={COMPANY_ID} payrollId={PAYROLL_ID} onEvent={onEvent} />,
    )

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
    server.use(
      handleGetPayroll(() => HttpResponse.json(buildTransitionPayroll())),
      handlePayrollsPrepare(() => HttpResponse.json(buildPreparedTransitionPayroll())),
    )
  })

  it('shows the transition details read only, with deductions included and the regular rate by default', async () => {
    renderComponent()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /transition payroll/i, level: 2 }),
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

  it('saves the chosen settings and emits transition/configured with the updated payroll', async () => {
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(buildPreparedTransitionPayroll({ check_date: '2025-09-02' }))
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

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
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updateBody).toMatchObject({
      skip_regular_deductions: true,
      withholding_pay_period: 'Every week',
      fixed_withholding_rate: true,
    })
  })

  it('shows the API error and does not emit transition/configured when the update fails', async () => {
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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Payroll cannot be updated')).toBeInTheDocument()
    })
    expect(onEvent).not.toHaveBeenCalledWith('transition/configured', expect.anything())
  })
})
