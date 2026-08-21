import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { PostV1PayrollsPayrollUuidGeneratedDocumentsPrintablePayrollChecksRequest } from '@gusto/embedded-api/models/operations/postv1payrollspayrolluuidgenerateddocumentsprintablepayrollchecks'
import type { GetV1GeneratedDocumentsDocumentTypeRequestUuidRequest } from '@gusto/embedded-api/models/operations/getv1generateddocumentsdocumenttyperequestuuid'
import { API_BASE_URL } from '@/test/constants'

export const createPayrollCheck = (overrides: Record<string, unknown> = {}) => ({
  payroll_uuid: 'payroll-1',
  printing_format: 'top',
  starting_check_number: null,
  request_uuid: 'print-checks-request-1',
  status: 'pending',
  employee_check_number_mapping: [{ employee_uuid: 'employee-1', check_number: 1001 }],
  ...overrides,
})

export const createGeneratedDocument = (overrides: Record<string, unknown> = {}) => ({
  request_uuid: 'print-checks-request-1',
  status: 'succeeded',
  document_urls: ['https://example.com/checks.pdf'],
  ...overrides,
})

export function handlePayrollsGeneratePrintableChecks(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1PayrollsPayrollUuidGeneratedDocumentsPrintablePayrollChecksRequest
  >,
) {
  return http.post(
    `${API_BASE_URL}/v1/payrolls/:payroll_uuid/generated_documents/printable_payroll_checks`,
    resolver,
  )
}

export function handleGeneratedDocumentsGet(
  resolver: HttpResponseResolver<PathParams, GetV1GeneratedDocumentsDocumentTypeRequestUuidRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/generated_documents/:document_type/:request_uuid`, resolver)
}

export const generatePrintableChecks = handlePayrollsGeneratePrintableChecks(() =>
  HttpResponse.json(createPayrollCheck(), { status: 200 }),
)

export const getGeneratedDocument = handleGeneratedDocumentsGet(() =>
  HttpResponse.json(createGeneratedDocument()),
)

export default [generatePrintableChecks, getGeneratedDocument]
