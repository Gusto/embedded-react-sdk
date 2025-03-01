import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const basicForm = {
  uuid: 'form-123',
  name: 'Test Form',
  status: 'not_signed',
  form_type: 'company',
  created_at: '2024-05-29T12:00:00Z',
  updated_at: '2024-05-29T12:30:00Z',
  requires_signing: true,
}

export function handleGetAllCompanyForms(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-company-forms'>,
    RequestBodyParams<'get-v1-company-forms'>,
    ResponseType<'get-v1-company-forms', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/forms`, resolver)
}

export function handleGetCompanyFormPdf(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-company-form-pdf'>,
    RequestBodyParams<'get-v1-company-form-pdf'>,
    ResponseType<'get-v1-company-form-pdf', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/forms/:form_id/pdf`, resolver)
}

export function handleSignCompanyForm(
  resolver: HttpResponseResolver<
    PathParams<'put-v1-company-form-sign'>,
    RequestBodyParams<'put-v1-company-form-sign'>,
    ResponseType<'put-v1-company-form-sign', 200>
  >,
) {
  return http.put(`${API_BASE_URL}/v1/forms/:form_id/sign`, resolver)
}

const getAllCompanyForms = handleGetAllCompanyForms(() => HttpResponse.json([basicForm]))

const getCompanyFormPdf = handleGetCompanyFormPdf(() =>
  HttpResponse.json({
    uuid: 'form-123',
    document_url: 'data:application/pdf;base64,JVBE',
  }),
)

const signCompanyForm = handleSignCompanyForm(() => HttpResponse.json(basicForm))

export default [getAllCompanyForms, getCompanyFormPdf, signCompanyForm]
