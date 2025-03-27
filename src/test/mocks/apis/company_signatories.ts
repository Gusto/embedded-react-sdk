import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1CompaniesCompanyUuidSignatoriesRequest,
  GetV1CompaniesCompanyUuidSignatoriesResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyuuidsignatories'
import type {
  PostV1CompanySignatoriesRequestBody,
  PostV1CompanySignatoriesResponse,
} from '@gusto/embedded-api/models/operations/postv1companysignatories'
import type {
  PutV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequestBody,
  PutV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyuuidsignatoriessignatoryuuid'
import type {
  PostV1CompaniesCompanyUuidSignatoriesInviteRequestBody,
  PostV1CompaniesCompanyUuidSignatoriesInviteResponse,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyuuidsignatoriesinvite'
import type {
  DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequest,
  DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse,
} from '@gusto/embedded-api/models/operations/deletev1companiescompanyuuidsignatoriessignatoryuuid'
import { API_BASE_URL } from '@/test/constants'

const basicSignatory = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  title: 'CEO',
  hasSsn: false,
  phone: '(555) 123-4567',
  birthday: '1980-01-01',
  homeAddress: {
    street1: '123 Main St',
    street2: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
  },
}

export function handleGetAllSignatories(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompaniesCompanyUuidSignatoriesRequest,
    GetV1CompaniesCompanyUuidSignatoriesResponse['signatoryList']
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/signatories`, resolver)
}

export function handleCreateSignatory(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1CompanySignatoriesRequestBody,
    PostV1CompanySignatoriesResponse['signatory']
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/signatories`, resolver)
}

export function handleUpdateSignatory(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequestBody,
    PutV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse['signatory']
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
    PostV1CompaniesCompanyUuidSignatoriesInviteRequestBody,
    PostV1CompaniesCompanyUuidSignatoriesInviteResponse['signatory']
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/signatories/invite`, resolver)
}

export function handleDeleteSignatory(
  resolver: HttpResponseResolver<
    PathParams<'delete-v1-companies-company_uuid-signatories-signatory_uuid'>,
    DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidRequest,
    DeleteV1CompaniesCompanyUuidSignatoriesSignatoryUuidResponse
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
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      email: requestBody.email,
      title: requestBody.title,
      phone: requestBody.phone,
      birthday: requestBody.birthday,
      hasSsn: Boolean(requestBody.ssn),
      homeAddress: {
        ...requestBody.homeAddress,
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
    uuid: signatory_uuid as string,
    firstName: requestBody.firstName || basicSignatory.firstName,
    lastName: requestBody.lastName || basicSignatory.lastName,
    email: basicSignatory.email, // Email can't be updated
    title: requestBody.title || basicSignatory.title,
    phone: requestBody.phone || basicSignatory.phone,
    birthday: requestBody.birthday || basicSignatory.birthday,
    hasSsn: requestBody.ssn ? true : basicSignatory.hasSsn,
    homeAddress: {
      ...(requestBody.homeAddress || basicSignatory.homeAddress),
      country: 'USA',
    },
  })
})

const inviteSignatory = handleInviteSignatory(async ({ request }) => {
  const requestBody = await request.json()

  return HttpResponse.json({
    uuid: 'new-signatory-uuid',
    firstName: requestBody.firstName,
    lastName: requestBody.lastName,
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
