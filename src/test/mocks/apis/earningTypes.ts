import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export function handleGetEarningTypes(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/earning_types`, resolver)
}

const getEarningTypes = handleGetEarningTypes(() =>
  HttpResponse.json({
    default: [
      {
        name: 'Bonus',
        uuid: 'et-bonus',
        active: true,
        category: 'NonDiscretionaryBonus',
        included_in_overtime_pay: true,
      },
      {
        name: 'Commission',
        uuid: 'et-commission',
        active: true,
        category: 'Commission',
        included_in_overtime_pay: true,
      },
      {
        name: 'Correction Payment',
        uuid: 'et-correction',
        active: true,
        category: 'CorrectionPayment',
        included_in_overtime_pay: true,
      },
      {
        name: 'Cash Tips',
        uuid: 'et-cash-tips',
        active: true,
        category: 'CashTips',
        included_in_overtime_pay: false,
      },
      {
        name: 'Paycheck Tips',
        uuid: 'et-paycheck-tips',
        active: true,
        category: 'PaycheckTips',
        included_in_overtime_pay: false,
      },
    ],
    custom: [],
  }),
)

export default [getEarningTypes]
