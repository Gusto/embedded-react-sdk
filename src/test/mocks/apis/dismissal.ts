import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { setPayrollPhase } from './payrolls'
import { API_BASE_URL } from '@/test/constants'

const getUnprocessedTerminationPayPeriods = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/pay_periods/unprocessed_termination_pay_periods`,
  async () => {
    const responseFixture = await getFixture(
      'get-v1-companies-company_id-pay_periods-unprocessed_termination_pay_periods',
    )
    return HttpResponse.json(responseFixture)
  },
)

const createOffCyclePayroll = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls`,
  async () => {
    setPayrollPhase('initial')
    const responseFixture = await getFixture('post-v1-companies-company_id-payrolls')
    return HttpResponse.json(responseFixture)
  },
)

export default [getUnprocessedTerminationPayPeriods, createOffCyclePayroll]
