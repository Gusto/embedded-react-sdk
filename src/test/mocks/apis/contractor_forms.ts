import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const FORM_1099_UUID = 'form-1099-uuid'

/** A finalized 1099 tax form, as returned by the contractor forms endpoint. */
export function build1099Form(overrides: Record<string, unknown> = {}) {
  return {
    uuid: FORM_1099_UUID,
    name: 'US_1099',
    title: 'Form 1099: 2026',
    description: 'Form 1099 records your annual income as a contractor.',
    requires_signing: false,
    year: 2026,
    quarter: null,
    document_content_type: 'application/pdf',
    contractor_uuid: 'contractor-123',
    draft: false,
    ...overrides,
  }
}

export function handleGetContractorForms(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/forms`, resolver)
}

export function handleGetContractorForm(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/forms/:form_id`, resolver)
}

export function handleGetContractorFormPdf(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/forms/:form_id/pdf`, resolver)
}

export const getContractorForms = handleGetContractorForms(() =>
  HttpResponse.json([build1099Form()]),
)

export const getContractorForm = handleGetContractorForm(() => HttpResponse.json(build1099Form()))

export const getContractorFormPdf = handleGetContractorFormPdf(({ params }) =>
  HttpResponse.json({
    uuid: params.form_id,
    document_url: 'https://gusto-test.com/docs/1099.pdf',
    document_content_type: 'application/pdf',
  }),
)

export default [getContractorForms, getContractorForm, getContractorFormPdf]
