import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { API_BASE_URL } from '@/test/constants'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

export const getCompany = http.get(`${API_BASE_URL}/v1/companies/:company_id`, ({ params }) =>
  HttpResponse.json({
    uuid: params.company_id,
    name: 'Test Company',
    trade_name: null,
    ein: '12-3456789',
    entity_type: 'LLC',
    is_suspended: false,
    company_status: 'Approved',
    tier: 'basic',
    primary_signatory: {
      uuid: 'signatory-uuid-123',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin@testcompany.com',
    },
    primary_payroll_admin: {
      uuid: 'admin-uuid-123',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin@testcompany.com',
    },
  }),
)

export const getCompanyOnboardingStatus = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/onboarding_status`,
  () =>
    HttpResponse.json({
      uuid: 'onboarding-status-uuid',
      onboarding_completed: false,
      onboarding_steps: [
        {
          title: 'Add your company addresses',
          id: 'add_addresses',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Federal tax setup',
          id: 'federal_tax_setup',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Select your industry',
          id: 'select_industry',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Add a bank account for direct debits',
          id: 'add_bank_info',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Add your team',
          id: 'add_employees',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Set up a pay schedule',
          id: 'payroll_schedule',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'State tax setup',
          id: 'state_setup',
          required: true,
          completed: false,
          requirement_sets: [],
        },
        {
          title: 'Sign documents',
          id: 'sign_all_forms',
          required: true,
          completed: false,
          requirement_sets: [],
        },
      ],
    }),
)

/**
 * Builds the wire body for the industry selection endpoints.
 *
 * The industry object sits at the top level of the response (see zenpayroll's
 * `company_industry_selections` rabl view); `@gusto/embedded-api` maps the whole
 * body onto `response.industry`, so wrapping it in an `industry` key here would
 * parse to an empty object.
 */
export function buildIndustrySelectionBody({
  naicsCode = '541511',
  title = 'Custom Computer Programming Services',
  companyUuid = '123',
  sicCodes = ['7371'],
}: {
  naicsCode?: string
  title?: string | null
  companyUuid?: string
  sicCodes?: string[]
} = {}) {
  return {
    company_uuid: companyUuid,
    naics_code: naicsCode,
    title,
    sic_codes: sicCodes,
  }
}

export function handleGetIndustrySelection(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, resolver)
}

export function handleUpdateIndustrySelection(resolver: HttpResponseResolver) {
  return http.put(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, resolver)
}

export const getIndustrySelection = handleGetIndustrySelection(() =>
  HttpResponse.json(buildIndustrySelectionBody()),
)

export const getPaymentConfigs = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`,
  async () => {
    const responseFixture = await getFixture('get-v1-companies-company_uuid-payment_configs')
    return HttpResponse.json(responseFixture)
  },
)

// The update endpoint answers `201 Created`, which is what the generated client matches on.
export const updateIndustrySelection = handleUpdateIndustrySelection(async ({ request }) => {
  const body = (await request.json()) as { naics_code?: string; title?: string } | null
  return HttpResponse.json(
    buildIndustrySelectionBody({
      naicsCode: body?.naics_code ?? '541511',
      ...(body?.title ? { title: body.title } : {}),
    }),
    { status: 201 },
  )
})
