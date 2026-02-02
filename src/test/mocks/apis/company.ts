import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

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

export const getIndustrySelection = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/industry_selection`,
  () =>
    HttpResponse.json({
      industry: {
        uuid: 'industry-uuid-123',
        company_uuid: '123',
        naics_code: '541511',
        title: 'Custom Computer Programming Services',
        has_sic_codes: true,
        sic_codes: ['7371'],
      },
    }),
)

export const updateIndustrySelection = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/industry_selection`,
  async ({ request }) => {
    const body = (await request.json()) as { naics_code?: string } | null
    return HttpResponse.json({
      industry: {
        uuid: 'industry-uuid-123',
        company_uuid: '123',
        naics_code: body?.naics_code ?? '541511',
        title: 'Custom Computer Programming Services',
        has_sic_codes: true,
        sic_codes: ['7371'],
      },
    })
  },
)
