import { HttpResponse } from 'msw'
import type { PrototypeComponent } from '../../prototypeTypes'
import { CompensationHistoryComponent } from './CompensationHistoryComponent'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { buildJob, type JobFixture } from '@/test/factories/jobsAndCompensations'

const MOCK_EMPLOYEE_ID = 'employee-uuid'

const singleJob = [
  buildJob({
    uuid: 'job-1',
    currentCompensationUuid: 'comp-1',
    title: 'Software engineer',
    rate: '85',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
  }),
]

const multipleJobs = [
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

const mixedWages = [
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

const renderComponent = () => <CompensationHistoryComponent employeeId={MOCK_EMPLOYEE_ID} />

const respond = (jobs: JobFixture[]) => handleGetEmployeeJobs(() => HttpResponse.json(jobs))

export const components: PrototypeComponent[] = [
  {
    slug: 'compensation-history',
    name: 'Compensation History',
    configurations: [
      {
        slug: 'single-job',
        name: 'Single job',
        description: 'One active job, one current compensation row.',
        handlers: [respond(singleJob)],
        render: renderComponent,
      },
      {
        slug: 'multiple-jobs',
        name: 'Multiple jobs',
        description: 'Two jobs — combined view with a job filter.',
        handlers: [respond(multipleJobs)],
        render: renderComponent,
      },
      {
        slug: 'mixed-wages',
        name: 'Mixed wages',
        description: 'Four jobs, all paid by the hour, with varied wage frequencies.',
        handlers: [respond(mixedWages)],
        render: renderComponent,
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No jobs.',
        handlers: [respond([])],
        render: renderComponent,
      },
    ],
  },
]
