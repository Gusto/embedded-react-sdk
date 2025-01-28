import { type BodyParams } from '@/api/typeHelpers'

export const COMPANY_LOCATION_FORM_PAYLOAD = {
  phone_number: '1234567890',
  street_1: '123 Main St',
  street_2: 'Apt 101',
  city: 'Anytown',
  state: 'ABC',
  zip: '12345',
  country: 'USA',
  mailing_address: true,
  filing_address: false,
} satisfies BodyParams<'/v1/companies/{company_id}/locations', 'POST'>
