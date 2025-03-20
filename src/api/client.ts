import createClient from 'openapi-fetch'
import { API_BASE_URL } from './constants'
import { handleResponse } from './queries/helpers'
import type { BodyParams, QueryParams } from './typeHelpers'
import { type paths } from '@/types/schema'

interface APIConfig {
  baseUrl: string
  headers?: Record<string, string | number>
}

const CONFIG_DEFAULTS: APIConfig = {
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-GUSTO-API-VERSION': '2024-04-01',
  },
}

class GustoClient {
  config: APIConfig = CONFIG_DEFAULTS
  private client: ReturnType<typeof createClient<paths>>

  constructor(config: APIConfig = CONFIG_DEFAULTS) {
    this.config = config
    this.client = createClient<paths>({
      baseUrl: config.baseUrl,
      headers: { ...CONFIG_DEFAULTS.headers, ...config.headers },
      querySerializer: {
        array: {
          style: 'form',
          explode: false,
        },
      },
    })
  }

  async getTokenInfo() {
    return this.client.GET('/v1/token_info', { params: {} })
  }

  async getCompany(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getCompanyOnboardingStatus(company_uuid: string) {
    return this.client.GET('/v1/companies/{company_uuid}/onboarding_status', {
      params: {
        path: {
          company_uuid,
        },
      },
    })
  }

  async getEmployee(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async createEmployee(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/employees', 'POST'>,
  ) {
    return this.client
      .POST('/v1/companies/{company_id}/employees', {
        params: {
          path: {
            company_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async updateEmployeeOnboardingStatus(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/onboarding_status', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_id}/onboarding_status', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getCompanyAddresses(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/locations', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }
  async getCompanyEmployees(company_id: string, per: number, page: number) {
    return this.client
      .GET('/v1/companies/{company_id}/employees', {
        params: {
          path: {
            company_id,
          },
          query: per && page ? { per, page } : undefined,
        },
      })
      .then(res => {
        // Gusto API implements pagination through headers, for this reason we are modifying data object for this response
        const pagination = {
          count: res.response.headers.get('x-Total-Count'),
          page: res.response.headers.get('x-Page'),
          totalPages: res.response.headers.get('x-Total-Pages'),
        }
        return {
          ...res,
          data: { items: res.data, pagination },
        }
      })
      .then(handleResponse)
  }

  async updateEmployee(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_id}', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async deleteEmployee(employee_id: string) {
    return this.client.DELETE('/v1/employees/{employee_id}', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  // HOME ADDRESS

  async getEmployeeHomeAddress(home_address_uuid: string) {
    return this.client.GET('/v1/home_addresses/{home_address_uuid}', {
      params: {
        path: {
          home_address_uuid,
        },
      },
    })
  }

  async getEmployeeHomeAddresses(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/home_addresses', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async createEmployeeHomeAddress(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/home_addresses', 'POST'>,
  ) {
    return this.client
      .POST('/v1/employees/{employee_id}/home_addresses', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async deleteEmployeeHomeAddress(home_address_uuid: string) {
    return this.client.DELETE('/v1/home_addresses/{home_address_uuid}', {
      params: {
        path: {
          home_address_uuid,
        },
      },
    })
  }

  async updateEmployeeHomeAddress(
    home_address_uuid: string,
    body: BodyParams<'/v1/home_addresses/{home_address_uuid}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/home_addresses/{home_address_uuid}', {
        params: {
          path: {
            home_address_uuid,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  // COMPANY ADDRESS

  async createCompanyLocation(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/locations', 'POST'>,
  ) {
    return this.client
      .POST('/v1/companies/{company_id}/locations', {
        params: {
          path: {
            company_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getCompanyLocations(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/locations', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getCompanyLocation(location_id: string) {
    return this.client.GET('/v1/locations/{location_id}', {
      params: {
        path: {
          location_id,
        },
      },
    })
  }
  async getMinimumWagesForLocation(location_uuid: string) {
    return this.client
      .GET('/v1/locations/{location_uuid}/minimum_wages', {
        params: {
          path: {
            location_uuid,
          },
        },
      })
      .then(handleResponse)
  }

  async updateCompanyLocation(
    location_id: string,
    body: BodyParams<'/v1/locations/{location_id}', 'PUT'>,
  ) {
    return this.client.PUT('/v1/locations/{location_id}', {
      params: {
        path: {
          location_id,
        },
      },
      body,
    })
  }

  // Company Federal Taxes

  async getCompanyFederalTaxes(company_id: string) {
    return this.client.GET('/v1/companies/{company_id}/federal_tax_details', {
      params: {
        path: {
          company_id,
        },
      },
    })
  }

  async updateCompanyFederalTaxes(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/federal_tax_details', 'PUT'>,
  ) {
    return this.client.PUT('/v1/companies/{company_id}/federal_tax_details', {
      params: {
        path: {
          company_id,
        },
      },
      body,
    })
  }

  // WORK ADDRESS

  async getEmployeeWorkAddress(work_address_uuid: string) {
    return this.client.GET('/v1/work_addresses/{work_address_uuid}', {
      params: {
        path: {
          work_address_uuid,
        },
      },
    })
  }

  async getEmployeeWorkAddresses(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/work_addresses', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async createEmployeeWorkAddress(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/work_addresses', 'POST'>,
  ) {
    return this.client
      .POST('/v1/employees/{employee_id}/work_addresses', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async deleteEmployeeWorkAddress(work_address_uuid: string) {
    return this.client.DELETE('/v1/work_addresses/{work_address_uuid}', {
      params: {
        path: {
          work_address_uuid,
        },
      },
    })
  }

  async updateEmployeeWorkAddress(
    work_address_uuid: string,
    body: BodyParams<'/v1/work_addresses/{work_address_uuid}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/work_addresses/{work_address_uuid}', {
        params: {
          path: {
            work_address_uuid,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async createCompanyBankAccount(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/bank_accounts', 'POST'>,
  ) {
    return this.client.POST('/v1/companies/{company_id}/bank_accounts', {
      params: {
        path: {
          company_id,
        },
      },
      body,
    })
  }

  async updateEmployeeBankAccount(
    employee_id: string,
    bank_account_uuid: string,
    body: BodyParams<'/v1/employees/{employee_id}/bank_accounts/{bank_account_uuid}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_id}/bank_accounts/{bank_account_uuid}', {
        params: {
          path: {
            employee_id,
            bank_account_uuid,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  // EMPLOYEE DEDUCTIONS

  async getDeduction(garnishment_id: string) {
    return this.client.GET('/v1/garnishments/{garnishment_id}', {
      params: {
        path: {
          garnishment_id,
        },
      },
    })
  }

  async getEmployeeDeductions(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/garnishments', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async createEmployeeDeduction(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/garnishments', 'POST'>,
  ) {
    return this.client
      .POST('/v1/employees/{employee_id}/garnishments', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async updateDeduction(
    garnishment_id: string,
    body: BodyParams<'/v1/garnishments/{garnishment_id}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/garnishments/{garnishment_id}', {
        params: {
          path: {
            garnishment_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  // Employee payment method

  async getEmployeeBankAccounts(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/bank_accounts', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async createEmployeeBankAccount(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/bank_accounts', 'POST'>,
  ) {
    return this.client
      .POST('/v1/employees/{employee_id}/bank_accounts', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async deleteEmployeeBankAccount(employee_id: string, bank_account_uuid: string) {
    return this.client
      .DELETE('/v1/employees/{employee_id}/bank_accounts/{bank_account_uuid}', {
        params: {
          path: {
            employee_id,
            bank_account_uuid,
          },
        },
      })
      .then(handleResponse)
  }

  async getEmployeePaymentMethod(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/payment_method', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async updateEmployeePaymentMethod(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/payment_method', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_id}/payment_method', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getEmployeeJobs(employee_id: string) {
    return this.client.GET('/v1/employees/{employee_id}/jobs', {
      params: {
        path: {
          employee_id,
        },
      },
    })
  }

  async getEmployeeJob(job_id: string) {
    return this.client.GET('/v1/jobs/{job_id}', {
      params: {
        path: {
          job_id,
        },
      },
    })
  }

  async createEmployeeJob(
    employee_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/jobs', 'POST'>,
  ) {
    return this.client
      .POST('/v1/employees/{employee_id}/jobs', {
        params: {
          path: {
            employee_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async updateEmployeeJob(job_id: string, body: BodyParams<'/v1/jobs/{job_id}', 'PUT'>) {
    return this.client
      .PUT('/v1/jobs/{job_id}', {
        params: {
          path: {
            job_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }
  async deleteEmployeeJob(job_id: string) {
    return this.client
      .DELETE('/v1/jobs/{job_id}', {
        params: {
          path: {
            job_id,
          },
        },
      })
      .then(handleResponse)
  }

  async createEmployeeCompensation(
    job_id: string,
    body: BodyParams<'/v1/jobs/{job_id}/compensations', 'POST'>,
  ) {
    return this.client.POST('/v1/jobs/{job_id}/compensations', {
      params: {
        path: {
          job_id,
        },
      },
      body,
    })
  }
  async updateEmployeeCompensation(
    compensation_id: string,
    body: BodyParams<'/v1/compensations/{compensation_id}', 'PUT'>,
  ) {
    return this.client.PUT('/v1/compensations/{compensation_id}', {
      params: {
        path: {
          compensation_id,
        },
      },
      body,
    })
  }

  async getEmployeeFederalTaxes(employee_uuid: string) {
    return this.client
      .GET('/v1/employees/{employee_uuid}/federal_taxes', {
        params: {
          path: {
            employee_uuid,
          },
        },
      })
      .then(handleResponse)
  }

  async updateEmployeeFederalTaxes(
    employee_uuid: string,
    body: BodyParams<'/v1/employees/{employee_uuid}/federal_taxes', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_uuid}/federal_taxes', {
        params: {
          path: {
            employee_uuid,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getEmployeeStateTaxes(employee_uuid: string) {
    return this.client
      .GET('/v1/employees/{employee_uuid}/state_taxes', {
        params: {
          path: {
            employee_uuid,
          },
        },
      })
      .then(handleResponse)
  }

  async updateEmployeeStateTaxes(
    employee_uuid: string,
    body: BodyParams<'/v1/employees/{employee_uuid}/state_taxes', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_uuid}/state_taxes', {
        params: {
          path: {
            employee_uuid,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  // Payrolls
  async getPendingPayrolls(company_id: string) {
    // FIXME: Hardcoding dates for first PR, expanding on it.
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)
    const endDate = new Date()

    return this.client.GET('/v1/companies/{company_id}/payrolls', {
      params: {
        path: {
          company_id,
        },
        query: {
          processing_statuses: ['unprocessed'],
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payroll_types: ['regular'],
        },
      },
    })
  }

  async getHistoricalPayrolls(companyId: string, startDate: Date, endDate: Date) {
    return this.client.GET('/v1/companies/{company_id}/payrolls', {
      params: {
        path: {
          company_id: companyId,
        },
        query: {
          processing_statuses: ['processed'],
          start_date: startDate.toISOString().substring(0, 10),
          end_date: endDate.toISOString().substring(0, 10),
          payroll_types: ['regular', 'off_cycle'],
          include: ['payroll_status_meta', 'totals'],
        },
      },
    })
  }

  async getPayroll(company_id: string, payroll_id: string) {
    return this.client.GET('/v1/companies/{company_id}/payrolls/{payroll_id}', {
      params: {
        path: {
          company_id,
          payroll_id,
        },
        query: {
          // @ts-expect-error Need to change OAS
          include: ['benefits', 'taxes', 'deductions', 'payroll_status_meta'].join(','),
        },
      },
    })
  }

  async getCompanyIndustry(companyId: string) {
    return this.client.GET('/v1/companies/{company_id}/industry_selection', {
      params: {
        path: {
          company_id: companyId,
        },
      },
    })
  }

  async updateCompanyIndustry(
    companyId: string,
    params: BodyParams<'/v1/companies/{company_id}/industry_selection', 'PUT'>,
  ) {
    return this.client.PUT('/v1/companies/{company_id}/industry_selection', {
      params: {
        path: {
          company_id: companyId,
        },
      },
      body: params,
    })
  }

  // State Tax Requirements
  async getStateTaxRequirements(company_uuid: string, state: string) {
    return this.client.GET('/v1/companies/{company_uuid}/tax_requirements/{state}', {
      params: {
        path: {
          company_uuid,
          state,
        },
      },
    })
  }

  //Employee onboarding status
  async getEmployeeOnboardingStatus(employee_id: string) {
    return this.client
      .GET('/v1/employees/{employee_id}/onboarding_status', {
        params: {
          path: {
            employee_id,
          },
        },
      })
      .then(handleResponse)
  }

  // Employee forms
  async getAllEmployeeForms(employee_id: string) {
    return this.client
      .GET('/v1/employees/{employee_id}/forms', {
        params: {
          path: {
            employee_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getEmployeeFormPdf(employee_id: string, form_id: string) {
    return this.client
      .GET('/v1/employees/{employee_id}/forms/{form_id}/pdf', {
        params: {
          path: {
            employee_id,
            form_id,
          },
        },
      })
      .then(handleResponse)
  }

  async signEmployeeForm(
    employee_id: string,
    form_id: string,
    body: BodyParams<'/v1/employees/{employee_id}/forms/{form_id}/sign', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/employees/{employee_id}/forms/{form_id}/sign', {
        params: {
          path: {
            employee_id,
            form_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  // Company forms
  async getAllCompanyForms(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/forms', {
        params: { path: { company_id } },
      })
      .then(handleResponse)
  }

  async getCompanyForm(form_id: string) {
    return this.client
      .GET('/v1/forms/{form_id}', {
        params: { path: { form_id } },
      })
      .then(handleResponse)
  }

  async getCompanyFormPdf(form_id: string) {
    return this.client
      .GET('/v1/forms/{form_id}/pdf', {
        params: { path: { form_id } },
      })
      .then(handleResponse)
  }

  async signCompanyForm(form_id: string, body: BodyParams<'/v1/forms/{form_id}/sign', 'PUT'>) {
    return this.client
      .PUT('/v1/forms/{form_id}/sign', {
        params: { path: { form_id } },
        body,
      })
      .then(handleResponse)
  }

  // Pay Schedule
  async getPaySchedule(pay_schedule_id: string, company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/pay_schedules/{pay_schedule_id}', {
        params: {
          path: {
            company_id,
            pay_schedule_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getAllPaySchedules(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/pay_schedules', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getPaySchedulePayPeriodsByCompany(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/pay_periods', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async getPayScheduleAssignmentsByCompany(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_id}/pay_schedules/assignments', {
        params: {
          path: {
            company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async createPaySchedule(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/pay_schedules', 'POST'>,
  ) {
    return this.client
      .POST('/v1/companies/{company_id}/pay_schedules', {
        params: {
          path: {
            company_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async updatePaySchedule(
    pay_schedule_id: string,
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/pay_schedules/{pay_schedule_id}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/companies/{company_id}/pay_schedules/{pay_schedule_id}', {
        params: {
          path: {
            company_id,
            pay_schedule_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getPaySchedulePreview(
    company_id: string,
    query: QueryParams<'/v1/companies/{company_id}/pay_schedules/preview'>,
  ) {
    return this.client
      .GET('/v1/companies/{company_id}/pay_schedules/preview', {
        params: {
          path: {
            company_id,
          },
          query: query,
        },
      })
      .then(handleResponse)
  }

  // Signatories
  async createSignatory(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_uuid}/signatories', 'POST'>,
  ) {
    return this.client
      .POST('/v1/companies/{company_uuid}/signatories', {
        params: {
          path: {
            company_uuid: company_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async getAllSignatories(company_id: string) {
    return this.client
      .GET('/v1/companies/{company_uuid}/signatories', {
        params: {
          path: {
            company_uuid: company_id,
          },
        },
      })
      .then(handleResponse)
  }

  async inviteSignatory(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_uuid}/signatories/invite', 'POST'>,
  ) {
    return this.client
      .POST('/v1/companies/{company_uuid}/signatories/invite', {
        params: {
          path: {
            company_uuid: company_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async updateSignatory(
    company_id: string,
    signatory_id: string,
    body: BodyParams<'/v1/companies/{company_uuid}/signatories/{signatory_uuid}', 'PUT'>,
  ) {
    return this.client
      .PUT('/v1/companies/{company_uuid}/signatories/{signatory_uuid}', {
        params: {
          path: {
            company_uuid: company_id,
            signatory_uuid: signatory_id,
          },
        },
        body,
      })
      .then(handleResponse)
  }

  async deleteSignatory(company_id: string, signatory_id: string) {
    return this.client
      .DELETE('/v1/companies/{company_uuid}/signatories/{signatory_uuid}', {
        params: {
          path: {
            company_uuid: company_id,
            signatory_uuid: signatory_id,
          },
        },
      })
      .then(handleResponse)
  }
}

export type { APIConfig }

export { GustoClient }
