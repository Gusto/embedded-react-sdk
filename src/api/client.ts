import createClient from 'openapi-fetch'
import { type paths } from '@/generated/schema'
import { API_BASE_URL } from './constants.js'
import { handleResponse } from './queries/helpers.js'
import type { BodyParams, QueryParams } from './typeHelpers'

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
  config: APIConfig
  private client: ReturnType<typeof createClient<paths>>

  constructor(config: APIConfig = CONFIG_DEFAULTS) {
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
  async getCompanyEmployees(company_id: string) {
    return this.client.GET('/v1/companies/{company_id}/employees', {
      params: {
        path: {
          company_id,
        },
      },
    })
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

  async previewPayScheduleDates(
    company_id: string,
    query: QueryParams<'/v1/companies/{company_id}/pay_schedules/preview'>,
  ) {
    return this.client.GET('/v1/companies/{company_id}/pay_schedules/preview', {
      params: {
        path: {
          company_id,
        },
        query,
      },
    })
  }

  async getEmployeeFederalTaxes(employee_uuid: string) {
    return this.client.GET('/v1/employees/{employee_uuid}/federal_taxes', {
      params: {
        path: {
          employee_uuid,
        },
      },
    })
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

  async createPaySchedule(
    company_id: string,
    body: BodyParams<'/v1/companies/{company_id}/pay_schedules', 'POST'>,
  ) {
    return this.client.POST('/v1/companies/{company_id}/pay_schedules', {
      params: {
        path: {
          company_id,
        },
      },
      body,
    })
  }

  async getPaySchedules(company_id: string) {
    return this.client.GET('/v1/companies/{company_id}/pay_schedules', {
      params: {
        path: {
          company_id,
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
}

export type { APIConfig }

export { GustoClient }
