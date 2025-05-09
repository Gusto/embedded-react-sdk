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

export const updateStateTaxRequirements = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
  async ({ request }) => {
    const responseFixture = await getFixture('get-v1-companies-company_id-tax_requirements-GA')
    return HttpResponse.json(responseFixture)
  },
)

export default [getStateTaxRequirements, getAllStateTaxRequirements, updateStateTaxRequirements]
