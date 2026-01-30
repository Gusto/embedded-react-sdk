import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const mockInformationRequests = [
  {
    uuid: 'rfi-1',
    company_uuid: 'company-123',
    type: 'company_onboarding',
    status: 'pending_response',
    blocking_payroll: true,
    required_questions: [
      {
        question_uuid: 'q-1',
        question_text:
          "Please upload a color photo of your Gusto signatory's passport. This helps us verify the identity of the signatory.",
        response_type: 'document',
      },
      {
        question_uuid: 'q-2',
        question_text:
          'In order to verify your business, successfully remit taxes, and complete your filings, we will update your company name, dba, and EIN according to the IRS documentation you provide if necessary. Please respond with "Confirm" to authorize this action.',
        response_type: 'text',
      },
    ],
  },
  {
    uuid: 'rfi-2',
    company_uuid: 'company-123',
    type: 'account_protection',
    status: 'pending_review',
    blocking_payroll: true,
    required_questions: [],
  },
  {
    uuid: 'rfi-3',
    company_uuid: 'company-123',
    type: 'company_onboarding',
    status: 'pending_response',
    blocking_payroll: false,
    required_questions: [
      {
        question_uuid: 'q-3',
        question_text: 'Please provide additional documentation for your business registration.',
        response_type: 'document',
      },
    ],
  },
]

export function handleGetInformationRequests(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/information_requests`, resolver)
}

export function handleSubmitInformationRequest(resolver: HttpResponseResolver) {
  return http.put(
    `${API_BASE_URL}/v1/information_requests/:information_request_uuid/submit`,
    resolver,
  )
}

const getInformationRequests = handleGetInformationRequests(() => {
  return HttpResponse.json(mockInformationRequests)
})

export const getEmptyInformationRequests = handleGetInformationRequests(() => {
  return HttpResponse.json([])
})

const submitInformationRequest = handleSubmitInformationRequest(() => {
  return HttpResponse.json({
    uuid: 'rfi-1',
    company_uuid: 'company-123',
    type: 'company_onboarding',
    status: 'pending_review',
    blocking_payroll: true,
  })
})

export default [getInformationRequests, submitInformationRequest]
