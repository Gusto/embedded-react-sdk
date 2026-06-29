import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

/**
 * Realistic W-9 `fields` fixture mirroring the shape returned by the contractor
 * document API (snake_case, pre-SDK parsing). Sourced from the gws-flows W-9
 * request spec.
 */
export const w9DocumentFields = [
  { key: 'name', value: 'Klay Thompson', data_type: 'full_name', required: true, page_number: 0 },
  { key: 'business_name', value: null, data_type: 'text', required: false, page_number: 0 },
  {
    key: 'individual_proprietor',
    value: null,
    data_type: 'checkbox',
    required: true,
    page_number: 0,
  },
  { key: 'c_corporation', value: null, data_type: 'checkbox', required: true, page_number: 0 },
  { key: 's_corporation', value: null, data_type: 'checkbox', required: true, page_number: 0 },
  { key: 'partnership', value: null, data_type: 'checkbox', required: true, page_number: 0 },
  { key: 'trust_estate', value: null, data_type: 'checkbox', required: true, page_number: 0 },
  {
    key: 'limited_liability_company',
    value: null,
    data_type: 'checkbox',
    required: true,
    page_number: 0,
  },
  { key: 'tax_classification', value: null, data_type: 'text', required: false, page_number: 0 },
  { key: 'exempt_payee_code', value: null, data_type: 'text', required: false, page_number: 0 },
  {
    key: 'exemption_from_FATCA',
    value: null,
    data_type: 'checkbox',
    required: true,
    page_number: 0,
  },
  { key: 'other', value: null, data_type: 'text', required: false, page_number: 0 },
  { key: 'other_text', value: null, data_type: 'text', required: false, page_number: 0 },
  { key: 'foreign_partners', value: null, data_type: 'checkbox', required: true, page_number: 0 },
  {
    key: 'home_address_street_1',
    value: '525 7th street',
    data_type: 'home_address_street_1',
    required: true,
    page_number: 0,
  },
  {
    key: 'home_address_street_2',
    value: '',
    data_type: 'home_address_street_2',
    required: true,
    page_number: 0,
  },
  {
    key: 'home_address_city',
    value: 'New York',
    data_type: 'home_address_city',
    required: true,
    page_number: 0,
  },
  {
    key: 'home_address_state',
    value: 'NY',
    data_type: 'home_address_state',
    required: true,
    page_number: 0,
  },
  {
    key: 'home_address_zip',
    value: '10022',
    data_type: 'home_address_zip',
    required: true,
    page_number: 0,
  },
  {
    key: 'company_name',
    value: 'Entercross Systems',
    data_type: 'company_name',
    required: true,
    page_number: 0,
  },
  { key: 'account_number', value: null, data_type: 'text', required: false, page_number: 0 },
  { key: 'ssn', value: 'XXX-XX-3123', data_type: 'ssn', required: true, page_number: 0 },
  { key: 'ein', value: 'N/A', data_type: 'ein', required: true, page_number: 0 },
  { key: 'signature_text', value: null, data_type: 'signature', required: true, page_number: 0 },
  { key: 'date', value: '9/17/2025', data_type: 'date', required: true, page_number: 0 },
]

export const W9_DOCUMENT_UUID = 'w9-document-uuid'
export const SIGNED_DOCUMENT_UUID = 'signed-document-uuid'

/** A signable W-9 document (unsigned), including pages and fields. */
export function buildW9Document(overrides: Record<string, unknown> = {}) {
  return {
    uuid: W9_DOCUMENT_UUID,
    title: 'W-9',
    name: 'taxpayer_identification_form_w_9',
    recipient_type: 'Contractor',
    requires_signing: true,
    signed_at: null,
    description: 'Request for Taxpayer Identification Number and Certification',
    pages: [{ page_number: 0, image_url: 'https://gusto-test.docs/page-0.png' }],
    fields: w9DocumentFields,
    ...overrides,
  }
}

/** The contractor documents list response (raw array). */
export function buildContractorDocumentsList(overrides?: Array<Record<string, unknown>>) {
  return (
    overrides ?? [
      {
        uuid: W9_DOCUMENT_UUID,
        title: 'W-9',
        name: 'taxpayer_identification_form_w_9',
        requires_signing: true,
        signed_at: null,
      },
      {
        uuid: SIGNED_DOCUMENT_UUID,
        title: 'Contractor handbook',
        name: 'contractor_handbook',
        requires_signing: false,
        signed_at: '2025-01-01T00:00:00Z',
      },
    ]
  )
}

export function handleGetContractorDocuments(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/documents`, resolver)
}

export function handleGetContractorDocument(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/documents/:document_uuid`, resolver)
}

export function handleGetContractorDocumentPdf(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/documents/:document_uuid/pdf`, resolver)
}

export function handleSignContractorDocument(resolver: HttpResponseResolver) {
  return http.put(`${API_BASE_URL}/v1/documents/:document_uuid/sign`, resolver)
}

export const getContractorDocuments = handleGetContractorDocuments(() =>
  HttpResponse.json(buildContractorDocumentsList()),
)

export const getContractorDocument = handleGetContractorDocument(() =>
  HttpResponse.json(buildW9Document()),
)

export const getContractorDocumentPdf = handleGetContractorDocumentPdf(({ params }) =>
  HttpResponse.json({
    uuid: params.document_uuid,
    document_url: 'https://gusto-test.com/docs/w9.pdf',
  }),
)

export const signContractorDocument = handleSignContractorDocument(({ params }) =>
  HttpResponse.json({
    uuid: params.document_uuid,
    title: 'W-9',
    name: 'taxpayer_identification_form_w_9',
    requires_signing: false,
    signed_at: new Date().toISOString(),
  }),
)

export default [
  getContractorDocuments,
  getContractorDocument,
  getContractorDocumentPdf,
  signContractorDocument,
]
