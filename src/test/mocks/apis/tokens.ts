import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1TokenInfoRequest,
  GetV1TokenInfoResponse,
} from '@gusto/embedded-api/models/operations/getv1tokeninfo'
import { API_BASE_URL } from '@/test/constants'

const getTokenInfo = http.get<PathParams, GetV1TokenInfoRequest, Partial<GetV1TokenInfoResponse>>(
  `${API_BASE_URL}/v1/token_info`,
  () =>
    HttpResponse.json({
      object: {
        scope: 'companies:read',
        resource: {
          type: 'Company',
          uuid: 'some-company-uuid',
        },
        resourceOwner: {
          type: 'CompanyAdmin',
          uuid: 'some-company-admin-uuid',
        },
      },
    }),
)

export default [getTokenInfo]
