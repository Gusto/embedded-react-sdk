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
    required_questions: [],
  },
  {
    uuid: 'rfi-2',
    company_uuid: 'company-123',
    type: 'account_protection',
    status: 'pending_review',
    blocking_payroll: true,
    required_questions: [],
  },
]

export function handleGetInformationRequests(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/information_requests`, resolver)
}

const getInformationRequests = handleGetInformationRequests(() => {
  return HttpResponse.json(mockInformationRequests)
})

export const getEmptyInformationRequests = handleGetInformationRequests(() => {
  return HttpResponse.json([])
})

export default [getInformationRequests]
