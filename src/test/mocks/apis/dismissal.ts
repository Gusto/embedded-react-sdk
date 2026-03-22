import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
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

export default [getUnprocessedTerminationPayPeriods]
