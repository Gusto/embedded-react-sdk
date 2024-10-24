import { http, HttpResponse } from 'msw'
import type { operations } from '../../../src/generated/schema'
import { API_BASE_URL } from '../../../src/api/constants'

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
