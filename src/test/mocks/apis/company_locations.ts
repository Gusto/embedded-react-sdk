import { http, HttpResponse, type PathParams } from 'msw'
import { type PostV1CompaniesCompanyIdLocationsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyidlocations'
import type { PutV1LocationsLocationIdRequestBody } from '@gusto/embedded-api/models/operations/putv1locationslocationid'
import type { Location$Outbound } from '@gusto/embedded-api/models/components/location'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const basicLocation = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  version: '1.0',
  company_uuid: '789e4567-e89b-12d3-a456-426614174001',
  phone_number: '123-456-7890',
  street_1: '123 Main St',
  street_2: 'Apt 101',
  city: 'Anytown',
  state: 'ABC',
  zip: '12345',
  country: 'USA',
  active: true,
  mailing_address: true,
  filing_address: false,
  created_at: '2024-05-29T12:00:00Z',
  updated_at: '2024-05-29T12:30:00Z',
}

export const getCompanyLocation = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/locations`,
  () => HttpResponse.json(basicLocation),
)

export const getCompanyLocations = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/locations`,
  () => HttpResponse.json([basicLocation]),
)

export const getEmptyCompanyLocations = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/locations`,
  () => HttpResponse.json([]),
)

export const getMinimumWages = http.get(
  `${API_BASE_URL}/v1/locations/:location_uuid/minimum_wages`,
  async () => {
    const responseFixture = await getFixture('get-v1-locations-location_uuid-minimum_wages')
    return HttpResponse.json(responseFixture)
  },
)

export const createCompanyLocation = http.post<
  PathParams,
  PostV1CompaniesCompanyIdLocationsRequestBody,
  Location$Outbound
>(`${API_BASE_URL}/v1/companies/:company_id/locations`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'location_uuid',
    version: '1.0',
    company_uuid: '789e4567-e89b-12d3-a456-426614174001',
    phone_number: requestBody.phoneNumber,
    street_1: requestBody.street1,
    street_2: requestBody.street2,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    //@ts-expect-error: //TODO: openapi issue - country is missing
    country: requestBody.country,
    active: true,
    mailing_address: requestBody.mailingAddress,
    filing_address: requestBody.filingAddress,
    created_at: '2024-05-29T12:00:00Z',
    updated_at: '2024-05-29T12:30:00Z',
  })
})

const updateCompanyLocation = http.put<
  PathParams,
  PutV1LocationsLocationIdRequestBody,
  Location$Outbound
>(`${API_BASE_URL}/v1/locations/:location_id`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'location_uuid',
    version: '1.0',
    company_uuid: '789e4567-e89b-12d3-a456-426614174001',
    phone_number: requestBody.phoneNumber,
    street_1: requestBody.street1,
    street_2: requestBody.street2,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    country: 'USA',
    active: true,
    mailing_address: requestBody.mailingAddress,
    filing_address: requestBody.filingAddress,
    created_at: '2024-05-29T12:00:00Z',
    updated_at: '2024-05-29T12:30:00Z',
  })
})

export default [
  getCompanyLocations,
  getCompanyLocation,
  createCompanyLocation,
  updateCompanyLocation,
]
