// Explicit fixture mapping to satisfy Vite's dynamic import requirements
const fixtureMap: Record<string, () => Promise<any>> = {
  'get-v1-companies-company_id-bank_accounts': () => import('./get-v1-companies-company_id-bank_accounts.json'),
  'get-v1-companies-company_id-federal_tax_details': () => import('./get-v1-companies-company_id-federal_tax_details.json'),
  'get-v1-companies-company_id-pay_schedules-preview': () => import('./get-v1-companies-company_id-pay_schedules-preview.json'),
  'get-v1-companies-company_id-pay_schedules': () => import('./get-v1-companies-company_id-pay_schedules.json'),
  'get-v1-companies-company_id-payrolls-processed-payrolls': () => import('./get-v1-companies-company_id-payrolls-processed-payrolls.json'),
  'get-v1-companies-company_id-tax_requirements-GA': () => import('./get-v1-companies-company_id-tax_requirements-GA.json'),
  'get-v1-companies-company_id-tax_requirements-WA': () => import('./get-v1-companies-company_id-tax_requirements-WA.json'),
  'get-v1-companies-company_id-tax_requirements': () => import('./get-v1-companies-company_id-tax_requirements.json'),
  'get-v1-contractors-contractor_id-address': () => import('./get-v1-contractors-contractor_id-address.json'),
  'get-v1-contractors-contractor_id-bank_accounts': () => import('./get-v1-contractors-contractor_id-bank_accounts.json'),
  'get-v1-contractors-contractor_id-payment_method': () => import('./get-v1-contractors-contractor_id-payment_method.json'),
  'get-v1-contractors-contractor_id': () => import('./get-v1-contractors-contractor_id.json'),
  'get-v1-employees-employee_id-bank_accounts': () => import('./get-v1-employees-employee_id-bank_accounts.json'),
  'get-v1-employees-employee_id-federal_taxes': () => import('./get-v1-employees-employee_id-federal_taxes.json'),
  'get-v1-employees-employee_id-home_addresses': () => import('./get-v1-employees-employee_id-home_addresses.json'),
  'get-v1-employees-employee_id-jobs': () => import('./get-v1-employees-employee_id-jobs.json'),
  'get-v1-employees-employee_id-onboarding_status': () => import('./get-v1-employees-employee_id-onboarding_status.json'),
  'get-v1-employees-employee_id-payment_method': () => import('./get-v1-employees-employee_id-payment_method.json'),
  'get-v1-employees-employee_id-state_taxes': () => import('./get-v1-employees-employee_id-state_taxes.json'),
  'get-v1-employees-employee_id-work_addresses': () => import('./get-v1-employees-employee_id-work_addresses.json'),
  'get-v1-employees': () => import('./get-v1-employees.json'),
  'get-v1-home_addresses-home_address_uuid': () => import('./get-v1-home_addresses-home_address_uuid.json'),
  'get-v1-locations-location_uuid-minimum_wages': () => import('./get-v1-locations-location_uuid-minimum_wages.json'),
  'get-v1-work_addresses-work_address_uuid': () => import('./get-v1-work_addresses-work_address_uuid.json'),
  'post-v1-companies-company_id-pay_schedules': () => import('./post-v1-companies-company_id-pay_schedules.json'),
  'put-v1-companies-company_id-pay_schedules-pay_schedule_id': () => import('./put-v1-companies-company_id-pay_schedules-pay_schedule_id.json'),
  'put-v1-contractors-contractor_id-address': () => import('./put-v1-contractors-contractor_id-address.json'),
}

export const getFixture = async (path: string) => {
  const loader = fixtureMap[path]
  if (!loader) {
    throw new Error(`Fixture not found: ${path}`)
  }
  const module = await loader()
  return module.default
}
