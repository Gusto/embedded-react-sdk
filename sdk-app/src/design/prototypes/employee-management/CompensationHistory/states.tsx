import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { Compensation } from '@gusto/embedded-api-v-2025-11-15/models/components/compensation'
import type { PrototypeComponent } from '../../prototypeTypes'
import { CompensationHistory } from '../../../components/employee/management/CompensationHistory/CompensationHistory'

interface BuildCompensationOverrides {
  uuid?: string
  jobUuid?: string
  title?: string
  rate?: string
  paymentUnit?: string
  flsaStatus?: string
  effectiveDate?: string
}

function buildCompensation(overrides: BuildCompensationOverrides): Compensation {
  return {
    uuid: overrides.uuid ?? 'compensation-uuid',
    version: 'compensation-version',
    paymentUnit: overrides.paymentUnit ?? 'Hour',
    flsaStatus: overrides.flsaStatus ?? 'Nonexempt',
    adjustForMinimumWage: false,
    jobUuid: overrides.jobUuid ?? 'job-uuid',
    title: overrides.title ?? 'My Job',
    effectiveDate: overrides.effectiveDate ?? '2024-12-24',
    rate: overrides.rate ?? '100.00',
  } as Compensation
}

interface BuildJobOverrides {
  uuid?: string
  currentCompensationUuid?: string
  title?: string
  rate?: string
  paymentUnit?: string
  flsaStatus?: string
  compensations?: Compensation[]
}

function buildJob(overrides: BuildJobOverrides): Job {
  const uuid = overrides.uuid ?? 'job-uuid'
  const currentCompensationUuid = overrides.currentCompensationUuid ?? 'compensation-uuid'
  const title = overrides.title ?? 'My Job'
  const compensations = overrides.compensations ?? [
    buildCompensation({
      uuid: currentCompensationUuid,
      jobUuid: uuid,
      title,
      flsaStatus: overrides.flsaStatus ?? 'Nonexempt',
      paymentUnit: overrides.paymentUnit ?? 'Hour',
      rate: overrides.rate ?? '100.00',
    }),
  ]

  return {
    uuid,
    version: 'job-version',
    employeeUuid: 'employee-uuid',
    currentCompensationUuid,
    paymentUnit: overrides.paymentUnit ?? 'Hour',
    primary: true,
    twoPercentShareholder: false,
    title,
    compensations,
    rate: overrides.rate ?? '100.00',
    hireDate: '2024-12-24',
  } as Job
}

const singleJob: Job[] = [
  buildJob({
    uuid: 'job-1',
    currentCompensationUuid: 'comp-1',
    title: 'Software engineer',
    rate: '85',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
]

const multipleJobs: Job[] = [
  buildJob({
    uuid: 'job-1',
    currentCompensationUuid: 'comp-1',
    title: 'Software engineer',
    rate: '85',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
  buildJob({
    uuid: 'job-2',
    currentCompensationUuid: 'comp-2',
    title: 'Team lead',
    rate: '120000',
    paymentUnit: 'Year',
    flsaStatus: 'Exempt',
  }),
]

const mixedWages: Job[] = [
  buildJob({
    uuid: 'job-1',
    currentCompensationUuid: 'comp-1',
    title: 'Server',
    rate: '44',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
  buildJob({
    uuid: 'job-2',
    currentCompensationUuid: 'comp-2',
    title: 'Bookkeeper',
    rate: '44000',
    paymentUnit: 'Year',
    flsaStatus: 'Nonexempt',
  }),
  buildJob({
    uuid: 'job-3',
    currentCompensationUuid: 'comp-3',
    title: 'Dishwasher',
    rate: '21',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
  buildJob({
    uuid: 'job-4',
    currentCompensationUuid: 'comp-4',
    title: 'Bartender',
    rate: '36',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
]

function renderJobs(jobs: Job[]) {
  function CompensationHistoryDemo() {
    return <CompensationHistory jobs={jobs} />
  }
  return CompensationHistoryDemo
}

export const components: PrototypeComponent[] = [
  {
    slug: 'compensation-history',
    name: 'Compensation History',
    configurations: [
      {
        slug: 'single-job',
        name: 'Single job',
        description: 'One active job, one current compensation row.',
        handlers: [],
        render: renderJobs(singleJob),
      },
      {
        slug: 'multiple-jobs',
        name: 'Multiple jobs',
        description: 'Two jobs — combined view with a job filter.',
        handlers: [],
        render: renderJobs(multipleJobs),
      },
      {
        slug: 'mixed-wages',
        name: 'Mixed wages',
        description: 'Four jobs, all paid by the hour, with varied wage frequencies.',
        handlers: [],
        render: renderJobs(mixedWages),
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No jobs.',
        handlers: [],
        render: renderJobs([]),
      },
    ],
  },
]
