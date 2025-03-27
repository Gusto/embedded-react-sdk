import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1CompanyFormsRequest,
  GetV1CompanyFormsResponse,
} from '@gusto/embedded-api/models/operations/getv1companyforms'
import type {
  GetV1CompanyFormRequest,
  GetV1CompanyFormResponse,
} from '@gusto/embedded-api/models/operations/getv1companyform'
import type { GetV1CompanyFormPdfResponse } from '@gusto/embedded-api/models/operations/getv1companyformpdf'
import type {
  PutV1CompanyFormSignRequestBody,
  PutV1CompanyFormSignResponse,
} from '@gusto/embedded-api/models/operations/putv1companyformsign'
import { API_BASE_URL } from '@/test/constants'

const basicForm = {
  uuid: 'form-123',
  name: 'Test Form',
  status: 'not_signed',
  formType: 'company',
  createdAt: '2024-05-29T12:00:00Z',
  updatedAt: '2024-05-29T12:30:00Z',
  requiresSigning: true,
}

export function handleGetAllCompanyForms(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompanyFormsRequest,
    Partial<GetV1CompanyFormsResponse>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/forms`, resolver)
}

export const getEmptyEmployeeForms = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/forms`,
  () => HttpResponse.json([]),
)

export function handleGetCompanyForm(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompanyFormRequest,
    GetV1CompanyFormResponse['form']
  >,
) {
  return http.get(`${API_BASE_URL}/v1/forms/:form_id`, resolver)
}

export function handleGetCompanyFormPdf(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompanyFormResponse,
    GetV1CompanyFormPdfResponse['formPdf']
  >,
) {
  return http.get(`${API_BASE_URL}/v1/forms/:form_id/pdf`, resolver)
}

export function handleSignCompanyForm(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompanyFormSignRequestBody,
    PutV1CompanyFormSignResponse['form']
  >,
) {
  return http.put(`${API_BASE_URL}/v1/forms/:form_id/sign`, resolver)
}

const getAllCompanyForms = handleGetAllCompanyForms(() =>
  HttpResponse.json({ formList: [basicForm] }),
)

const getCompanyForm = handleGetCompanyForm(() => HttpResponse.json(basicForm))

const getCompanyFormPdf = handleGetCompanyFormPdf(() =>
  HttpResponse.json({ uuid: 'form-123', documentUrl: 'data:application/pdf;base64,JVBE' }),
)

const signCompanyForm = handleSignCompanyForm(() => HttpResponse.json(basicForm))

export default [getAllCompanyForms, getCompanyForm, getCompanyFormPdf, signCompanyForm]
