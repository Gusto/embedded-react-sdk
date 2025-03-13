import { http, HttpResponse } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const basicLocation = {
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

const getCompanyLocation = http.get<
  PathParams<'get-v1-locations-location_id'>,
  RequestBodyParams<'get-v1-locations-location_id'>,
  ResponseType<'get-v1-locations-location_id', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/locations`, () => HttpResponse.json(basicLocation))

export const getCompanyLocations = http.get<
  PathParams<'get-v1-companies-company_id-locations'>,
  RequestBodyParams<'get-v1-companies-company_id-locations'>,
  ResponseType<'get-v1-companies-company_id-locations', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/locations`, () => HttpResponse.json([basicLocation]))

const createCompanyLocation = http.post<
  PathParams<'post-v1-companies-company_id-locations'>,
  RequestBodyParams<'post-v1-companies-company_id-locations'>,
  ResponseType<'post-v1-companies-company_id-locations', 201>
>(`${API_BASE_URL}/v1/companies/:company_id/locations`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'location_uuid',
    version: '1.0',
    company_uuid: '789e4567-e89b-12d3-a456-426614174001',
    phone_number: requestBody.phone_number,
    street_1: requestBody.street_1,
    street_2: requestBody.street_2,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    // @ts-expect-error: //TODO: investigate
    country: requestBody.country,
    active: true,
    mailing_address: requestBody.mailing_address,
    filing_address: requestBody.filing_address,
    created_at: '2024-05-29T12:00:00Z',
    updated_at: '2024-05-29T12:30:00Z',
  })
})

const updateCompanyLocation = http.put<
  PathParams<'put-v1-locations-location_id'>,
  RequestBodyParams<'put-v1-locations-location_id'>,
  ResponseType<'put-v1-locations-location_id', 200>
>(`${API_BASE_URL}/v1/locations/:location_id`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'location_uuid',
    version: '1.0',
    company_uuid: '789e4567-e89b-12d3-a456-426614174001',
    phone_number: requestBody.phone_number,
    street_1: requestBody.street_1,
    street_2: requestBody.street_2,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    country: 'USA',
    active: true,
    mailing_address: requestBody.mailing_address,
    filing_address: requestBody.filing_address,
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
