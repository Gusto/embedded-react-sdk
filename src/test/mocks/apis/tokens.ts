import { API_BASE_URL } from '@/api/constants'
import { operations } from '@/types/schema'
import { http, HttpResponse } from 'msw'

type GetTokenInfoParams = object
type GetTokenInfoRequestBody = object
type GetTokenInfoResponse =
  operations['get-v1-token-info']['responses']['200']['content']['application/json']

const getTokenInfo = http.get<GetTokenInfoParams, GetTokenInfoRequestBody, GetTokenInfoResponse>(
  `${API_BASE_URL}/v1/token_info`,
  () =>
    HttpResponse.json({
      scope: 'companies:read',
      resource: {
        type: 'Company',
        uuid: 'some-company-uuid',
      },
      resource_owner: {
        type: 'CompanyAdmin',
        uuid: 'some-company-admin-uuid',
      },
    }),
)

export default [getTokenInfo]
