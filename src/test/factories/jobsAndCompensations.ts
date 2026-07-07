/**
 * Test factories for Jobs + Compensations integration tests.
 *
 * Returns snake_case JSON shapes (the API wire format) so factories can be
 * fed directly to MSW handlers that pass through `HttpResponse.json(...)`.
 * The Speakeasy SDK transforms these into camelCase for the React Query layer.
 *
 * Each builder validates its output against the SDK's public `*FromJSON`
 * parser so any drift between our fixtures and the `@gusto/embedded-api-v-2026-02-01` wire
 * schema fails loudly at the call site instead of producing silently-wrong
 * camelCase data inside hooks under test.
 */

import { compensationFromJSON } from '@gusto/embedded-api/models/components/compensation'
import { jobFromJSON } from '@gusto/embedded-api/models/components/job'

export type CompensationFixture = {
  uuid: string
  version: string
  payment_unit: string
  flsa_status: string
  adjust_for_minimum_wage: boolean
  job_uuid: string
  title?: string
  effective_date: string
  rate: string
  minimum_wages?: Array<{ uuid: string }>
}

export type JobFixture = {
  uuid: string
  version: string
  employee_uuid: string
  current_compensation_uuid: string
  payment_unit: string
  primary: boolean
  two_percent_shareholder: boolean
  title: string
  state_wc_covered?: boolean | null
  state_wc_class_code?: string | null
  compensations: CompensationFixture[]
  rate: string
  hire_date: string
}

function assertValidCompensation(fixture: CompensationFixture): CompensationFixture {
  const result = compensationFromJSON(JSON.stringify(fixture))
  if (!result.ok) {
    throw new Error(
      `buildCompensation produced a fixture that does not match @gusto/embedded-api-v-2026-02-01 Compensation schema: ${result.error.message}`,
    )
  }
  return fixture
}

function assertValidJob(fixture: JobFixture): JobFixture {
  const result = jobFromJSON(JSON.stringify(fixture))
  if (!result.ok) {
    throw new Error(
      `buildJob produced a fixture that does not match @gusto/embedded-api-v-2026-02-01 Job schema: ${result.error.message}`,
    )
  }
  return fixture
}

export interface BuildJobOverrides {
  uuid?: string
  version?: string
  employeeUuid?: string
  primary?: boolean
  title?: string
  rate?: string
  paymentUnit?: string
  hireDate?: string
  flsaStatus?: string
  twoPercentShareholder?: boolean
  stateWcCovered?: boolean | null
  stateWcClassCode?: string | null
  currentCompensationUuid?: string
  compensations?: CompensationFixture[]
}

export function buildCompensation(
  overrides: Partial<CompensationFixture> = {},
): CompensationFixture {
  return assertValidCompensation({
    uuid: 'compensation-uuid',
    version: 'compensation-version-123',
    payment_unit: 'Hour',
    flsa_status: 'Nonexempt',
    adjust_for_minimum_wage: false,
    job_uuid: 'job-uuid',
    effective_date: '2024-12-24',
    rate: '100.00',
    ...overrides,
  })
}

export function buildJob(overrides: BuildJobOverrides = {}): JobFixture {
  const uuid = overrides.uuid ?? 'job-uuid'
  const currentCompensationUuid = overrides.currentCompensationUuid ?? 'compensation-uuid'
  const title = overrides.title ?? 'My Job'
  // Default compensation mirrors `job.title` because that's how the server
  // populates the comp at job creation time. Tests that need to assert
  // staleness between `job.title` and the comp's title should override
  // `compensations` explicitly.
  const compensations = overrides.compensations ?? [
    buildCompensation({
      uuid: currentCompensationUuid,
      job_uuid: uuid,
      title,
      flsa_status: overrides.flsaStatus ?? 'Nonexempt',
      payment_unit: overrides.paymentUnit ?? 'Hour',
      rate: overrides.rate ?? '100.00',
    }),
  ]

  return assertValidJob({
    uuid,
    version: overrides.version ?? 'job-version-123',
    employee_uuid: overrides.employeeUuid ?? 'employee-uuid',
    current_compensation_uuid: currentCompensationUuid,
    payment_unit: overrides.paymentUnit ?? 'Hour',
    primary: overrides.primary ?? true,
    two_percent_shareholder: overrides.twoPercentShareholder ?? false,
    title,
    state_wc_covered: overrides.stateWcCovered ?? null,
    state_wc_class_code: overrides.stateWcClassCode ?? null,
    compensations,
    rate: overrides.rate ?? '100.00',
    hire_date: overrides.hireDate ?? '2024-12-24',
  })
}

export type EmployeeJobsScenario =
  | 'noJobs'
  | 'singleNonexempt'
  | 'singleExempt'
  | 'multiJob'
  | 'futureCompPending'
  | 'newPrimaryJob'
  | 'newPrimaryJobWithSecondaries'
  | 'newSecondaryJob'

export interface BuildEmployeeWithJobsOptions {
  scenario: EmployeeJobsScenario
  employeeUuid?: string
}

export function buildEmployeeWithJobs({
  scenario,
  employeeUuid = 'employee-uuid',
}: BuildEmployeeWithJobsOptions): JobFixture[] {
  switch (scenario) {
    case 'noJobs':
      return []

    case 'singleNonexempt':
      return [
        buildJob({
          uuid: 'job-uuid',
          employeeUuid,
          primary: true,
          title: 'My Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '100.00',
        }),
      ]

    case 'singleExempt':
      return [
        buildJob({
          uuid: 'job-uuid',
          version: 'job-version-456',
          employeeUuid,
          primary: true,
          title: 'My Job',
          flsaStatus: 'Exempt',
          paymentUnit: 'Year',
          rate: '100000.00',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              version: 'compensation-version-456',
              job_uuid: 'job-uuid',
              title: 'My Job',
              flsa_status: 'Exempt',
              payment_unit: 'Year',
              rate: '100000.00',
            }),
          ],
        }),
      ]

    case 'multiJob':
      return [
        buildJob({
          uuid: 'job-uuid',
          version: 'job-version-789',
          employeeUuid,
          primary: true,
          title: 'My Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '100.00',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              version: 'compensation-version-789',
              job_uuid: 'job-uuid',
              title: 'My Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '100.00',
            }),
          ],
        }),
        buildJob({
          uuid: 'job-uuid-2',
          version: 'job-version-790',
          employeeUuid,
          primary: false,
          title: 'An additional job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '250.00',
          currentCompensationUuid: 'compensation-uuid-2',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid-2',
              version: 'compensation-version-790',
              job_uuid: 'job-uuid-2',
              title: 'An additional job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '250.00',
            }),
          ],
        }),
      ]

    case 'futureCompPending':
      return [
        buildJob({
          uuid: 'job-uuid',
          employeeUuid,
          primary: true,
          title: 'My Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '100.00',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              job_uuid: 'job-uuid',
              title: 'My Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '100.00',
              effective_date: '2024-12-24',
            }),
            buildCompensation({
              uuid: 'compensation-future-uuid',
              version: 'compensation-future-version-1',
              job_uuid: 'job-uuid',
              title: 'My Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '125.00',
              effective_date: '2099-01-01',
            }),
          ],
        }),
      ]

    case 'newPrimaryJob':
      // Primary job that hasn't started yet — hire_date and the single
      // compensation's effective_date are both in the future. No current
      // (on-or-before-today) comp, so isNewJob is true.
      return [
        buildJob({
          uuid: 'job-uuid',
          employeeUuid,
          primary: true,
          title: 'My New Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '50.00',
          hireDate: '2099-06-01',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              version: 'compensation-version-123',
              job_uuid: 'job-uuid',
              title: 'My New Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '50.00',
              effective_date: '2099-06-01',
            }),
          ],
        }),
      ]

    case 'newSecondaryJob':
      // Active primary + a secondary job whose only compensation has a
      // future effective_date — the secondary itself hasn't started yet,
      // so `isNewJob` is true on the secondary while the primary stays
      // current. Mirrors the dashboard state reached via "Add another job"
      // with a future effective date.
      return [
        buildJob({
          uuid: 'job-uuid',
          employeeUuid,
          primary: true,
          title: 'My Primary Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '100.00',
          hireDate: '2024-12-24',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              version: 'compensation-version-primary',
              job_uuid: 'job-uuid',
              title: 'My Primary Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '100.00',
              effective_date: '2024-12-24',
            }),
          ],
        }),
        buildJob({
          uuid: 'secondary-job-uuid',
          version: 'secondary-job-version-1',
          employeeUuid,
          primary: false,
          title: 'My Secondary Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '50.00',
          hireDate: '2024-12-24',
          currentCompensationUuid: 'secondary-compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'secondary-compensation-uuid',
              version: 'secondary-compensation-version-1',
              job_uuid: 'secondary-job-uuid',
              title: 'My Secondary Job',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '50.00',
              effective_date: '2099-06-01',
            }),
          ],
        }),
      ]

    case 'newPrimaryJobWithSecondaries':
      // Primary new job (future hire_date) plus two secondary jobs covering both
      // branches of the slide-2 rule when the primary's hire_date moves:
      //   secondary A: comp effective_date is later than the primary hire_date
      //     (stays-the-same case when hire_date moves within that window)
      //   secondary B: comp effective_date equals the primary hire_date
      //     (must-advance case for any forward hire_date change)
      return [
        buildJob({
          uuid: 'job-uuid',
          employeeUuid,
          primary: true,
          title: 'My New Job',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '50.00',
          hireDate: '2099-07-01',
          currentCompensationUuid: 'compensation-uuid',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid',
              version: 'compensation-version-primary',
              job_uuid: 'job-uuid',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '50.00',
              effective_date: '2099-07-01',
            }),
          ],
        }),
        buildJob({
          uuid: 'job-uuid-secondary-a',
          version: 'job-version-secondary-a',
          employeeUuid,
          primary: false,
          title: 'Side Gig A',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '20.00',
          hireDate: '2099-07-01',
          currentCompensationUuid: 'compensation-uuid-secondary-a',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid-secondary-a',
              version: 'compensation-version-secondary-a',
              job_uuid: 'job-uuid-secondary-a',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '20.00',
              effective_date: '2099-08-16',
            }),
          ],
        }),
        buildJob({
          uuid: 'job-uuid-secondary-b',
          version: 'job-version-secondary-b',
          employeeUuid,
          primary: false,
          title: 'Side Gig B',
          flsaStatus: 'Nonexempt',
          paymentUnit: 'Hour',
          rate: '30.00',
          hireDate: '2099-07-01',
          currentCompensationUuid: 'compensation-uuid-secondary-b',
          compensations: [
            buildCompensation({
              uuid: 'compensation-uuid-secondary-b',
              version: 'compensation-version-secondary-b',
              job_uuid: 'job-uuid-secondary-b',
              flsa_status: 'Nonexempt',
              payment_unit: 'Hour',
              rate: '30.00',
              effective_date: '2099-07-01',
            }),
          ],
        }),
      ]
  }
}
