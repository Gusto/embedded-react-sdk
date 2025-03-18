import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/api/constants'

export const getEmptyOnboardingStatus = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`,
  () =>
    HttpResponse.json({
      uuid: '',
      onboarding_status: 'onboarding_completed',
      onboarding_steps: [],
    }),
)
