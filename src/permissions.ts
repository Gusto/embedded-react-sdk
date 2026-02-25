export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface Endpoint {
  method: EndpointMethod
  path: string
}

type ExtractPathParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractPathParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
    ? Param
    : never

export const BLOCK_ENDPOINTS = {
  // --- Employee blocks ---

  'Employee.Landing': [
    { method: 'GET', path: '/v1/employees/:employeeId' },
    { method: 'GET', path: '/v1/companies/:companyId' },
  ],

  'Employee.Profile': [
    { method: 'GET', path: '/v1/companies/:companyId/locations' },
    { method: 'POST', path: '/v1/companies/:companyId/employees' },
    { method: 'GET', path: '/v1/employees/:employeeId' },
    { method: 'PUT', path: '/v1/employees/:employeeId' },
    { method: 'GET', path: '/v1/employees/:employeeId/home_addresses' },
    { method: 'POST', path: '/v1/employees/:employeeId/home_addresses' },
    { method: 'PUT', path: '/v1/home_addresses/:homeAddressUuid' },
    { method: 'GET', path: '/v1/employees/:employeeId/work_addresses' },
    { method: 'POST', path: '/v1/employees/:employeeId/work_addresses' },
    { method: 'PUT', path: '/v1/work_addresses/:workAddressUuid' },
    { method: 'PUT', path: '/v1/employees/:employeeId/onboarding_status' },
  ],

  'Employee.FederalTaxes': [
    { method: 'GET', path: '/v1/employees/:employeeId/federal_taxes' },
    { method: 'PUT', path: '/v1/employees/:employeeId/federal_taxes' },
  ],

  'Employee.StateTaxes': [
    { method: 'GET', path: '/v1/employees/:employeeId/state_taxes' },
    { method: 'PUT', path: '/v1/employees/:employeeId/state_taxes' },
  ],

  'Employee.PaymentMethod': [
    { method: 'GET', path: '/v1/employees/:employeeId/payment_method' },
    { method: 'PUT', path: '/v1/employees/:employeeId/payment_method' },
    { method: 'GET', path: '/v1/employees/:employeeId/bank_accounts' },
    { method: 'POST', path: '/v1/employees/:employeeId/bank_accounts' },
    { method: 'PUT', path: '/v1/employees/:employeeId/bank_accounts/:bankAccountUuid' },
    { method: 'DELETE', path: '/v1/employees/:employeeId/bank_accounts/:bankAccountUuid' },
  ],

  'Employee.EmployeeList': [
    { method: 'GET', path: '/v1/companies/:companyId/employees' },
    { method: 'DELETE', path: '/v1/employees/:employeeId' },
    { method: 'PUT', path: '/v1/employees/:employeeId/onboarding_status' },
  ],

  'Employee.Compensation': [
    { method: 'GET', path: '/v1/employees/:employeeId/jobs' },
    { method: 'POST', path: '/v1/employees/:employeeId/jobs' },
    { method: 'PUT', path: '/v1/jobs/:jobId' },
    { method: 'DELETE', path: '/v1/jobs/:jobId' },
    { method: 'PUT', path: '/v1/compensations/:compensationId' },
    { method: 'GET', path: '/v1/locations/:locationUuid/minimum_wages' },
    { method: 'GET', path: '/v1/employees/:employeeId/work_addresses' },
    { method: 'GET', path: '/v1/companies/:companyId/federal_tax_details' },
    { method: 'GET', path: '/v1/employees/:employeeId' },
  ],

  'Employee.Deductions': [
    { method: 'GET', path: '/v1/employees/:employeeId/garnishments' },
    { method: 'GET', path: '/v1/employees/:employeeId/garnishments/child_support_data' },
    { method: 'POST', path: '/v1/employees/:employeeId/garnishments' },
    { method: 'PUT', path: '/v1/employees/:employeeId/garnishments/:garnishmentId' },
  ],

  'Employee.OnboardingSummary': [
    { method: 'GET', path: '/v1/employees/:employeeId' },
    { method: 'GET', path: '/v1/employees/:employeeId/onboarding_status' },
  ],

  'Employee.DocumentSigner': [
    { method: 'GET', path: '/v1/employees/:employeeId/forms' },
    { method: 'GET', path: '/v1/employees/:employeeId/forms/:formId' },
    { method: 'GET', path: '/v1/employees/:employeeId/forms/:formId/pdf' },
    { method: 'POST', path: '/v1/employees/:employeeId/forms/:formId/sign' },
  ],

  // --- Company blocks ---

  'Company.Locations': [{ method: 'GET', path: '/v1/companies/:companyId/locations' }],

  'Company.FederalTaxes': [
    { method: 'GET', path: '/v1/companies/:companyId/federal_tax_details' },
    { method: 'PUT', path: '/v1/companies/:companyId/federal_tax_details' },
  ],

  'Company.Industry': [
    { method: 'GET', path: '/v1/companies/:companyId/industry_selection' },
    { method: 'PUT', path: '/v1/companies/:companyId/industry_selection' },
  ],

  'Company.BankAccount': [
    { method: 'GET', path: '/v1/companies/:companyId/bank_accounts' },
    { method: 'POST', path: '/v1/companies/:companyId/bank_accounts' },
    {
      method: 'PUT',
      path: '/v1/companies/:companyId/bank_accounts/:bankAccountUuid/verify',
    },
  ],

  'Company.PaySchedule': [
    { method: 'GET', path: '/v1/companies/:companyId/pay_schedules' },
    { method: 'POST', path: '/v1/companies/:companyId/pay_schedules' },
    { method: 'PUT', path: '/v1/companies/:companyId/pay_schedules/:payScheduleId' },
    { method: 'GET', path: '/v1/companies/:companyId/pay_schedules/preview' },
  ],

  'Company.StateTaxes': [
    { method: 'GET', path: '/v1/companies/:companyId/tax_requirements' },
    { method: 'GET', path: '/v1/companies/:companyId/tax_requirements/:state' },
    { method: 'PUT', path: '/v1/companies/:companyId/tax_requirements/:state' },
  ],

  'Company.OnboardingOverview': [
    { method: 'GET', path: '/v1/companies/:companyId/onboarding_status' },
  ],

  'Company.DocumentSigner': [
    { method: 'GET', path: '/v1/companies/:companyId/signatories' },
    { method: 'GET', path: '/v1/companies/:companyId/forms' },
    { method: 'GET', path: '/v1/companies/:companyId/forms/:formId' },
    { method: 'GET', path: '/v1/companies/:companyId/forms/:formId/pdf' },
    { method: 'POST', path: '/v1/companies/:companyId/forms/:formId/sign' },
  ],

  'Company.AssignSignatory': [
    { method: 'GET', path: '/v1/companies/:companyId/signatories' },
    { method: 'POST', path: '/v1/companies/:companyId/signatories' },
    { method: 'POST', path: '/v1/companies/:companyId/signatories/invite' },
  ],

  // --- Contractor blocks ---

  'Contractor.ContractorList': [
    { method: 'GET', path: '/v1/companies/:companyId/contractors' },
    { method: 'DELETE', path: '/v1/contractors/:contractorUuid' },
  ],

  'Contractor.ContractorProfile': [
    { method: 'GET', path: '/v1/contractors/:contractorUuid' },
    { method: 'POST', path: '/v1/companies/:companyId/contractors' },
    { method: 'PUT', path: '/v1/contractors/:contractorUuid' },
  ],

  'Contractor.Address': [
    { method: 'GET', path: '/v1/contractors/:contractorUuid' },
    { method: 'GET', path: '/v1/contractors/:contractorUuid/address' },
    { method: 'PUT', path: '/v1/contractors/:contractorUuid/address' },
  ],

  'Contractor.PaymentMethod': [
    { method: 'GET', path: '/v1/contractors/:contractorUuid/payment_method' },
    { method: 'PUT', path: '/v1/contractors/:contractorUuid/payment_method' },
    { method: 'GET', path: '/v1/contractors/:contractorUuid/bank_accounts' },
    { method: 'POST', path: '/v1/contractors/:contractorUuid/bank_accounts' },
  ],

  'Contractor.NewHireReport': [
    { method: 'GET', path: '/v1/contractors/:contractorUuid' },
    { method: 'PUT', path: '/v1/contractors/:contractorUuid' },
  ],

  'Contractor.ContractorSubmit': [
    { method: 'GET', path: '/v1/contractors/:contractorUuid/onboarding_status' },
    { method: 'PUT', path: '/v1/contractors/:contractorUuid/onboarding_status' },
    { method: 'GET', path: '/v1/contractors/:contractorUuid' },
  ],

  // --- Payroll blocks ---

  'Payroll.PayrollList': [
    { method: 'GET', path: '/v1/companies/:companyId/payrolls' },
    { method: 'GET', path: '/v1/companies/:companyId/pay_schedules' },
    { method: 'GET', path: '/v1/companies/:companyId/payrolls/blockers' },
    { method: 'GET', path: '/v1/companies/:companyId/wire_in_requests' },
    { method: 'POST', path: '/v1/payrolls/:payrollId/skip' },
  ],

  'Payroll.PayrollConfiguration': [
    { method: 'GET', path: '/v1/payrolls/:payrollId' },
    { method: 'PUT', path: '/v1/payrolls/:payrollId' },
    { method: 'POST', path: '/v1/payrolls/:payrollId/calculate' },
    { method: 'GET', path: '/v1/companies/:companyId/payrolls/blockers' },
  ],

  'Payroll.PayrollOverview': [
    { method: 'GET', path: '/v1/payrolls/:payrollId' },
    { method: 'POST', path: '/v1/payrolls/:payrollId/submit' },
    { method: 'POST', path: '/v1/payrolls/:payrollId/cancel' },
    { method: 'GET', path: '/v1/companies/:companyId/bank_accounts' },
    { method: 'GET', path: '/v1/companies/:companyId/employees' },
    { method: 'GET', path: '/v1/wire_in_requests/:wireInRequestId' },
    { method: 'GET', path: '/v1/payrolls/:payrollId/pay_stubs/:employeeId' },
  ],

  'Payroll.PayrollEditEmployee': [
    { method: 'GET', path: '/v1/employees/:employeeId' },
    { method: 'GET', path: '/v1/employees/:employeeId/bank_accounts' },
    { method: 'GET', path: '/v1/payrolls/:payrollId' },
    { method: 'PUT', path: '/v1/payrolls/:payrollId' },
  ],

  'Payroll.PayrollReceipts': [{ method: 'GET', path: '/v1/payrolls/:payrollId/receipt' }],

  'Payroll.PayrollBlockerList': [
    { method: 'GET', path: '/v1/companies/:companyId/payrolls/blockers' },
    { method: 'GET', path: '/v1/companies/:companyId/recovery_cases' },
    { method: 'GET', path: '/v1/companies/:companyId/information_requests' },
    { method: 'POST', path: '/v1/information_requests/:informationRequestId/submit' },
    { method: 'POST', path: '/v1/recovery_cases/:recoveryCaseId/redebit' },
  ],

  // --- Contractor Payments blocks ---

  'Contractor.Payments.PaymentList': [
    { method: 'GET', path: '/v1/companies/:companyId/contractor_payment_groups' },
    { method: 'GET', path: '/v1/companies/:companyId/contractors' },
    { method: 'GET', path: '/v1/companies/:companyId/bank_accounts' },
    { method: 'GET', path: '/v1/companies/:companyId/information_requests' },
    { method: 'POST', path: '/v1/information_requests/:informationRequestId/submit' },
  ],

  'Contractor.Payments.CreatePayment': [
    { method: 'POST', path: '/v1/companies/:companyId/contractor_payment_groups' },
    { method: 'POST', path: '/v1/contractor_payment_groups/:paymentGroupId/preview' },
    { method: 'DELETE', path: '/v1/contractor_payments/:paymentId' },
    { method: 'GET', path: '/v1/companies/:companyId/contractors' },
  ],

  'Contractor.Payments.PaymentReceipt': [
    { method: 'GET', path: '/v1/contractor_payment_groups/:paymentGroupId' },
    { method: 'GET', path: '/v1/contractor_payment_groups/:paymentGroupId/receipt' },
  ],
} as const satisfies Record<string, readonly Endpoint[]>

export type BlockName = keyof typeof BLOCK_ENDPOINTS

export type BlockVariables<B extends BlockName> = ExtractPathParams<
  (typeof BLOCK_ENDPOINTS)[B][number]['path']
>

function blockEndpoints<B extends BlockName>(name: B) {
  return BLOCK_ENDPOINTS[name]
}

export const FLOW_ENDPOINTS = {
  'Company.OnboardingFlow': [
    ...blockEndpoints('Company.Locations'),
    ...blockEndpoints('Company.FederalTaxes'),
    ...blockEndpoints('Company.Industry'),
    ...blockEndpoints('Company.BankAccount'),
    ...blockEndpoints('Employee.EmployeeList'),
    ...blockEndpoints('Company.PaySchedule'),
    ...blockEndpoints('Company.StateTaxes'),
    ...blockEndpoints('Company.DocumentSigner'),
    ...blockEndpoints('Company.AssignSignatory'),
    ...blockEndpoints('Company.OnboardingOverview'),
  ],

  'Employee.OnboardingFlow': [
    ...blockEndpoints('Employee.EmployeeList'),
    ...blockEndpoints('Employee.Profile'),
    ...blockEndpoints('Employee.Compensation'),
    ...blockEndpoints('Employee.FederalTaxes'),
    ...blockEndpoints('Employee.StateTaxes'),
    ...blockEndpoints('Employee.PaymentMethod'),
    ...blockEndpoints('Employee.Deductions'),
    ...blockEndpoints('Employee.DocumentSigner'),
    ...blockEndpoints('Employee.OnboardingSummary'),
  ],

  'Employee.SelfOnboardingFlow': [
    ...blockEndpoints('Employee.Landing'),
    ...blockEndpoints('Employee.Profile'),
    ...blockEndpoints('Employee.FederalTaxes'),
    ...blockEndpoints('Employee.StateTaxes'),
    ...blockEndpoints('Employee.PaymentMethod'),
    ...blockEndpoints('Employee.OnboardingSummary'),
  ],

  'Contractor.OnboardingFlow': [
    ...blockEndpoints('Contractor.ContractorList'),
    ...blockEndpoints('Contractor.ContractorProfile'),
    ...blockEndpoints('Contractor.Address'),
    ...blockEndpoints('Contractor.PaymentMethod'),
    ...blockEndpoints('Contractor.NewHireReport'),
    ...blockEndpoints('Contractor.ContractorSubmit'),
  ],

  'Contractor.Payments.PaymentFlow': [
    ...blockEndpoints('Contractor.Payments.PaymentList'),
    ...blockEndpoints('Contractor.Payments.CreatePayment'),
    ...blockEndpoints('Contractor.Payments.PaymentReceipt'),
  ],

  'Payroll.PayrollFlow': [
    ...blockEndpoints('Payroll.PayrollList'),
    ...blockEndpoints('Payroll.PayrollConfiguration'),
    ...blockEndpoints('Payroll.PayrollOverview'),
    ...blockEndpoints('Payroll.PayrollEditEmployee'),
    ...blockEndpoints('Payroll.PayrollReceipts'),
    ...blockEndpoints('Payroll.PayrollBlockerList'),
  ],
} as const satisfies Record<string, readonly Endpoint[]>

export type FlowName = keyof typeof FLOW_ENDPOINTS

export type FlowVariables<F extends FlowName> = ExtractPathParams<
  (typeof FLOW_ENDPOINTS)[F][number]['path']
>
