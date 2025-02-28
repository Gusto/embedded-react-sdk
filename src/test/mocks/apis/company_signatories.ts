import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const basicSignatory = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  company_uuid: '789e4567-e89b-12d3-a456-426614174001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  title: 'CEO',
  created_at: '2024-05-29T12:00:00Z',
  updated_at: '2024-05-29T12:30:00Z',
}

export function handleGetAllSignatories(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-companies-company_uuid-signatories'>,
    RequestBodyParams<'get-v1-companies-company_uuid-signatories'>,
    ResponseType<'get-v1-companies-company_uuid-signatories', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/signatories`, resolver)
}

const getAllSignatories = handleGetAllSignatories(() => HttpResponse.json([basicSignatory]))

const inviteSignatory = http.post<
  PathParams<'post-v1-companies-company_uuid-signatories-invite'>,
  RequestBodyParams<'post-v1-companies-company_uuid-signatories-invite'>,
  ResponseType<'post-v1-companies-company_uuid-signatories-invite', 201>
>(`${API_BASE_URL}/v1/companies/:company_id/signatories/invite`, async ({ request }) => {
  const requestBody = await request.json()

  return HttpResponse.json({
    uuid: 'new_signatory_uuid',
    first_name: requestBody.first_name,
    last_name: requestBody.last_name,
    email: requestBody.email,
    title: requestBody.title,
  })
})

const deleteSignatory = http.delete<
  PathParams<'delete-v1-companies-company_uuid-signatories-signatory_uuid'>,
  RequestBodyParams<'delete-v1-companies-company_uuid-signatories-signatory_uuid'>,
  ResponseType<'delete-v1-companies-company_uuid-signatories-signatory_uuid', 204>
>(`${API_BASE_URL}/v1/companies/:company_id/signatories/:signatory_id`, () => {
  return new HttpResponse(null, {
    status: 204,
  })
})

export default [getAllSignatories, inviteSignatory, deleteSignatory]
