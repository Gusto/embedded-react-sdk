import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeGarnishments = http.get(
  `${API_BASE_URL}/v1/garnishments/child_support`,
  () => HttpResponse.json([]),
)
