import { http, HttpResponse } from 'msw'
import type { PathParams } from './typeHelpers'
import { API_BASE_URL } from '@/test/constants'

export const getCompany = http.get<PathParams<'get-v1-companies'>>(
  `${API_BASE_URL}/v1/companies/:company_id`,
  ({ params }) =>
    HttpResponse.json({
      uuid: params.company_id,
    }),
)
