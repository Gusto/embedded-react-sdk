import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const getEmptyCompanyStateTaxes = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/state_taxes`,
  () => HttpResponse.json([]),
)

export const updateEmptyCompanyStateTaxes = http.put(
  `${API_BASE_URL}/v1/employees/:employee_id/state_taxes`,
  () => HttpResponse.json([]),
)
