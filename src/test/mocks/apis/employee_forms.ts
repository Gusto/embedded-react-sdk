import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

const i9Form = {
  uuid: 'i9-form-123',
  name: 'US_I-9',
  title: 'Form I-9',
  description: 'Form I-9 records your authorization to work in the USA.',
  requires_signing: true,
  year: null,
  quarter: null,
  document_content_type: 'application/pdf',
  employee_uuid: 'employee-123',
  draft: false,
}

const i9FormPdf = {
  uuid: 'i9-form-123',
  document_url: 'https://example.com/test-i9.pdf',
  document_content_type: 'application/pdf',
}

export function handleGetEmployeeForm(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/forms/:form_id`, resolver)
}

export function handleGetEmployeeFormPdf(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/forms/:form_id/pdf`, resolver)
}

export function handleSignEmployeeForm(resolver: HttpResponseResolver) {
  return http.put(`${API_BASE_URL}/v1/employees/:employee_id/forms/:form_id/sign`, resolver)
}

const getEmployeeForm = handleGetEmployeeForm(() => HttpResponse.json(i9Form))
const getEmployeeFormPdf = handleGetEmployeeFormPdf(() => HttpResponse.json(i9FormPdf))
const signEmployeeForm = handleSignEmployeeForm(() =>
  HttpResponse.json({ ...i9Form, requires_signing: false }),
)

export { i9Form, i9FormPdf }
export default [getEmployeeForm, getEmployeeFormPdf, signEmployeeForm]
