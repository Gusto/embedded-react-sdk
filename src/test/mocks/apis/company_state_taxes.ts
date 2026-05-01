import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getStateTaxRequirements = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
  async ({ params }) => {
    const state = params.state as string
    const GAFixture = await getFixture('get-v1-companies-company_id-tax_requirements-GA')
    const WAFixture = await getFixture('get-v1-companies-company_id-tax_requirements-WA')
    return HttpResponse.json(state === 'WA' ? WAFixture : GAFixture)
  },
)

export const getAllStateTaxRequirements = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements`,
  async () => {
    const responseFixture = await getFixture('get-v1-companies-company_id-tax_requirements')
    return HttpResponse.json(responseFixture)
  },
)

export const getEmptyAllStateTaxRequirements = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements`,
  () => HttpResponse.json([]),
)

/**
 * Returns fixture data covering all four Phase 2 setup_status states from the design:
 * - WY: not_started
 * - FL: in_progress
 * - GA: complete + default_rates_applied
 * - CA: complete + ready_to_run_payroll
 */
export const getAllStateTaxRequirementsWithStatus = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements`,
  () =>
    HttpResponse.json([
      {
        state: 'WY',
        setup_complete: false,
        setup_status: 'not_started',
        default_rates_applied: false,
        ready_to_run_payroll: false,
      },
      {
        state: 'FL',
        setup_complete: false,
        setup_status: 'in_progress',
        default_rates_applied: false,
        ready_to_run_payroll: false,
      },
      {
        state: 'GA',
        setup_complete: true,
        setup_status: 'complete',
        default_rates_applied: true,
        ready_to_run_payroll: false,
      },
      {
        state: 'CA',
        setup_complete: true,
        setup_status: 'complete',
        default_rates_applied: false,
        ready_to_run_payroll: true,
      },
    ]),
)

export const updateStateTaxRequirements = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
  async ({ request }) => {
    const responseFixture = await getFixture('get-v1-companies-company_id-tax_requirements-GA')
    return HttpResponse.json(responseFixture)
  },
)

export default [getStateTaxRequirements, getAllStateTaxRequirements, updateStateTaxRequirements]
