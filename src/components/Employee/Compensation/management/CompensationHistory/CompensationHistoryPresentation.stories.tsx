import { fn } from 'storybook/test'
import { CompensationHistoryPresentation } from './CompensationHistoryPresentation'
import type { JobCompensationHistory } from '@/components/Employee/Compensation/shared/getCompensationHistory'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/Employee/Management/CompensationHistory',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onBack = fn().mockName('onBack')

const engineerHistory: JobCompensationHistory = {
  jobId: 'job-1',
  jobTitle: 'Software engineer',
  isPrimary: true,
  entries: [
    {
      compensationId: 'comp-4',
      effectiveDate: '2099-03-01',
      title: 'Senior engineer',
      flsaStatus: 'Exempt',
      rate: '140000.00',
      paymentUnit: 'Year',
      status: 'upcoming',
    },
    {
      compensationId: 'comp-3',
      effectiveDate: '2025-01-01',
      title: 'Software engineer',
      flsaStatus: 'Nonexempt',
      rate: '85.00',
      paymentUnit: 'Hour',
      status: 'current',
    },
    {
      compensationId: 'comp-2',
      effectiveDate: '2024-06-01',
      title: 'Software engineer',
      flsaStatus: 'Nonexempt',
      rate: '72.00',
      paymentUnit: 'Hour',
      status: 'past',
    },
    {
      compensationId: 'comp-1',
      effectiveDate: '2023-02-01',
      title: 'Junior engineer',
      flsaStatus: 'Nonexempt',
      rate: '60.00',
      paymentUnit: 'Hour',
      status: 'past',
    },
  ],
}

const teamLeadHistory: JobCompensationHistory = {
  jobId: 'job-2',
  jobTitle: 'Team lead',
  isPrimary: false,
  entries: [
    {
      compensationId: 'comp-6',
      effectiveDate: '2025-04-01',
      title: 'Team lead',
      flsaStatus: 'Nonexempt',
      rate: '110.00',
      paymentUnit: 'Hour',
      status: 'current',
    },
    {
      compensationId: 'comp-5',
      effectiveDate: '2024-09-01',
      title: 'Team lead',
      flsaStatus: 'Nonexempt',
      rate: '100.00',
      paymentUnit: 'Hour',
      status: 'past',
    },
  ],
}

/** A single job with several raises, a current rate, and a scheduled change. */
export const SingleJob = () => (
  <CompensationHistoryPresentation jobs={[engineerHistory]} onBack={onBack} />
)

/** Two jobs, each with its own stacked history section. */
export const MultipleJobs = () => (
  <CompensationHistoryPresentation jobs={[engineerHistory, teamLeadHistory]} onBack={onBack} />
)

/** A job the employee has not started yet — no current row, so every entry is upcoming. */
export const NotYetStarted = () => (
  <CompensationHistoryPresentation
    jobs={[
      {
        jobId: 'job-3',
        jobTitle: 'Line cook',
        isPrimary: true,
        entries: [
          {
            compensationId: 'comp-8',
            effectiveDate: '2099-10-01',
            title: 'Line cook',
            flsaStatus: 'Nonexempt',
            rate: '26.00',
            paymentUnit: 'Hour',
            status: 'upcoming',
          },
          {
            compensationId: 'comp-7',
            effectiveDate: '2099-07-01',
            title: 'Line cook',
            flsaStatus: 'Nonexempt',
            rate: '24.00',
            paymentUnit: 'Hour',
            status: 'upcoming',
          },
        ],
      },
    ]}
    onBack={onBack}
  />
)

/** No jobs on record. */
export const Empty = () => <CompensationHistoryPresentation jobs={[]} onBack={onBack} />

/** In-place loading while the history fetch is in flight. */
export const Loading = () => <CompensationHistoryPresentation jobs={[]} isLoading onBack={onBack} />
