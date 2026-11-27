import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import type { QueryClient } from '@tanstack/react-query'
import { usePreparedPayrollData } from './usePreparedPayrollData'
import { BaseComponent } from '@/components/Base/Base'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import {
  handleGetSubmittedPayroll,
  handleGetUnsubmittedPayroll,
  handlePayrollsPrepare,
} from '@/test/mocks/apis/payrolls'

function PreparedPayrollProbe() {
  const { preparedPayroll, isLoading, isPayrollAlreadySubmitted } = usePreparedPayrollData({
    companyId: 'company-1',
    payrollId: 'payroll-1',
  })

  if (isLoading) return <p>Loading prepared payroll</p>
  if (isPayrollAlreadySubmitted) return <p>Payroll already submitted</p>
  return <p>{preparedPayroll ? 'Prepared payroll ready' : 'No prepared payroll'}</p>
}

function renderProbe(queryClient: QueryClient = createSdkQueryClient()) {
  return render(
    <GustoTestProvider queryClient={queryClient}>
      <BaseComponent onEvent={vi.fn()}>
        <PreparedPayrollProbe />
      </BaseComponent>
    </GustoTestProvider>,
  )
}

describe('usePreparedPayrollData', () => {
  let prepareResolver: ReturnType<typeof vi.fn<HttpResponseResolver>>

  beforeEach(() => {
    setupApiTestMocks()
    prepareResolver = vi.fn<HttpResponseResolver>(async () =>
      HttpResponse.json(
        await getFixture('put-v1-companies-company_id-payrolls-payroll_id-prepare'),
      ),
    )
    server.use(handlePayrollsPrepare(prepareResolver))
  })

  it('prepares a payroll that has not been submitted', async () => {
    server.use(handleGetUnsubmittedPayroll())

    renderProbe()

    expect(await screen.findByText('Prepared payroll ready')).toBeInTheDocument()
    expect(prepareResolver).toHaveBeenCalledTimes(1)
  })

  it('skips prepare and reports the payroll as already submitted', async () => {
    server.use(handleGetSubmittedPayroll())

    renderProbe()

    expect(await screen.findByText('Payroll already submitted')).toBeInTheDocument()
    expect(prepareResolver).not.toHaveBeenCalled()
  })

  it('waits for a fresh payroll read instead of trusting a stale cached status', async () => {
    const queryClient = createSdkQueryClient()
    server.use(handleGetUnsubmittedPayroll())
    const firstVisit = renderProbe(queryClient)
    await screen.findByText('Prepared payroll ready')
    firstVisit.unmount()

    server.use(handleGetSubmittedPayroll())
    await queryClient.invalidateQueries()
    renderProbe(queryClient)

    expect(await screen.findByText('Payroll already submitted')).toBeInTheDocument()
    expect(prepareResolver).toHaveBeenCalledTimes(1)
  })
})
