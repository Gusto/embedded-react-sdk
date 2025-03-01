import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const basicSignatory = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  title: 'CEO',
  has_ssn: false,
  phone: '(555) 123-4567',
  birthday: '1980-01-01',
  home_address: {
    street_1: '123 Main St',
    street_2: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
  },
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

export function handleCreateSignatory(
  resolver: HttpResponseResolver<
    PathParams<'post-v1-company-signatories'>,
    RequestBodyParams<'post-v1-company-signatories'>,
    ResponseType<'post-v1-company-signatories', 200>
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/signatories`, resolver)
}

export function handleUpdateSignatory(
  resolver: HttpResponseResolver<
    PathParams<'put-v1-companies-company_uuid-signatories-signatory_uuid'>,
    RequestBodyParams<'put-v1-companies-company_uuid-signatories-signatory_uuid'>,
    ResponseType<'put-v1-companies-company_uuid-signatories-signatory_uuid', 200>
  >,
) {
  return http.put(
    `${API_BASE_URL}/v1/companies/:company_uuid/signatories/:signatory_uuid`,
    resolver,
  )
}

export function handleInviteSignatory(
  resolver: HttpResponseResolver<
    PathParams<'post-v1-companies-company_uuid-signatories-invite'>,
    RequestBodyParams<'post-v1-companies-company_uuid-signatories-invite'>,
    ResponseType<'post-v1-companies-company_uuid-signatories-invite', 201>
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/signatories/invite`, resolver)
}

export function handleDeleteSignatory(
  resolver: HttpResponseResolver<
    PathParams<'delete-v1-companies-company_uuid-signatories-signatory_uuid'>,
    RequestBodyParams<'delete-v1-companies-company_uuid-signatories-signatory_uuid'>,
    ResponseType<'delete-v1-companies-company_uuid-signatories-signatory_uuid', 204>
  >,
) {
  return http.delete(`${API_BASE_URL}/v1/companies/:company_id/signatories/:signatory_id`, resolver)
}

const getAllSignatories = handleGetAllSignatories(() => HttpResponse.json([basicSignatory]))

const createSignatory = handleCreateSignatory(async ({ request }) => {
  const requestBody = await request.json()

  return HttpResponse.json(
    {
      uuid: 'new-signatory-uuid',
      first_name: requestBody.first_name,
      last_name: requestBody.last_name,
      email: requestBody.email,
      title: requestBody.title,
      phone: requestBody.phone,
      birthday: requestBody.birthday,
      has_ssn: Boolean(requestBody.ssn),
      home_address: {
        ...requestBody.home_address,
        country: 'USA',
      },
    },
    { status: 201 },
  )
})

const updateSignatory = handleUpdateSignatory(async ({ params, request }) => {
  const { signatory_uuid } = params
  const requestBody = await request.json()

  return HttpResponse.json({
    uuid: signatory_uuid,
    first_name: requestBody.first_name || basicSignatory.first_name,
    last_name: requestBody.last_name || basicSignatory.last_name,
    email: basicSignatory.email, // Email can't be updated
    title: requestBody.title || basicSignatory.title,
    phone: requestBody.phone || basicSignatory.phone,
    birthday: requestBody.birthday || basicSignatory.birthday,
    has_ssn: requestBody.ssn ? true : basicSignatory.has_ssn,
    home_address: {
      ...(requestBody.home_address || basicSignatory.home_address),
      country: 'USA',
    },
  })
})

const inviteSignatory = handleInviteSignatory(async ({ request }) => {
  const requestBody = await request.json()

  return HttpResponse.json({
    uuid: 'new-signatory-uuid',
    first_name: requestBody.first_name,
    last_name: requestBody.last_name,
    email: requestBody.email,
    title: requestBody.title,
  })
})

const deleteSignatory = handleDeleteSignatory(() => {
  return new HttpResponse(null, {
    status: 204,
  })
})

export default [
  getAllSignatories,
  createSignatory,
  updateSignatory,
  inviteSignatory,
  deleteSignatory,
]
