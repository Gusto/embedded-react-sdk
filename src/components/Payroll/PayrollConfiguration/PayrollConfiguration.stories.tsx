import { fn } from 'storybook/test'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'

export default {
  title: 'Domain/Payroll/PayrollConfiguration',
}

export const PayrollConfigurationStory = () => {
  return (
    <PayrollConfigurationPresentation
      employeeCompensations={[
        {
          excluded: false,
          paymentMethod: 'Direct Deposit',
          memo: null,
          fixedCompensations: [],
          hourlyCompensations: [
            {
              flsaStatus: 'Nonexempt',
              name: 'Regular Hours',
              jobUuid: 'test-job-uuid',
              amount: '880.0',
              compensationMultiplier: 1.0,
              hours: '40.000',
            },
          ],
          employeeUuid: 'test-employee-uuid',
          version: 'test-version',
          paidTimeOff: [
            {
              name: 'Vacation Hours',
              hours: '0.0',
            },
          ],
          grossPay: 880.0,
          netPay: 767.99,
          checkAmount: 767.99,
        },
      ]}
      employeeDetails={[
        {
          uuid: 'test-employee-uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          companyUuid: 'test-company-uuid',
          managerUuid: null,
          version: 'test-version',
          currentEmploymentStatus: 'full_time',
          onboardingStatus: 'onboarding_completed',
          preferredFirstName: null,
          departmentUuid: 'test-department-uuid',
          employeeCode: 'JD001',
          paymentMethod: 'Direct Deposit',
          department: 'Engineering',
          terminated: false,
          twoPercentShareholder: false,
          onboarded: true,
          historical: false,
          hasSsn: true,
          onboardingDocumentsConfig: {
            uuid: null,
            i9Document: false,
          },
          jobs: [
            {
              uuid: 'test-job-uuid',
              version: 'test-version',
              employeeUuid: 'test-employee-uuid',
              currentCompensationUuid: 'test-compensation-uuid',
              paymentUnit: 'Hour',
              primary: true,
              twoPercentShareholder: false,
              stateWcCovered: null,
              stateWcClassCode: null,
              title: 'Software Engineer',
              compensations: [
                {
                  uuid: 'test-compensation-uuid',
                  employeeUuid: 'test-employee-uuid',
                  version: 'test-version',
                  paymentUnit: 'Hour',
                  flsaStatus: 'Nonexempt',
                  adjustForMinimumWage: false,
                  minimumWages: [],
                  jobUuid: 'test-job-uuid',
                  effectiveDate: '2025-01-01',
                  rate: '22.00',
                },
              ],
              rate: '22.00',
              hireDate: '2024-01-01',
            },
          ],
          eligiblePaidTimeOff: [],
          terminations: [],
          garnishments: [],
          dateOfBirth: '1990-01-01',
          ssn: '',
          phone: null,
          workEmail: null,
        },
      ]}
      payPeriod={{
        startDate: '2025-07-30',
        endDate: '2025-08-13',
        payScheduleUuid: 'test-pay-schedule-uuid',
      }}
      onCalculatePayroll={fn().mockName('on_calculate')}
      onEdit={fn().mockName('on_edit')}
      onToggleExclude={fn().mockName('on_toggle_exclude')}
      onViewBlockers={fn().mockName('on_view_blockers')}
    />
  )
}

const mockBlockers: ApiPayrollBlocker[] = [
  {
    key: 'missing_bank_info',
    message: 'Company must have a bank account in order to run payroll.',
  },
  {
    key: 'missing_signatory',
    message:
      'A signatory who is authorized to sign documents on behalf of your company is required.',
  },
]

export const WithBlockers = () => {
  return (
    <PayrollConfigurationPresentation
      employeeCompensations={[
        {
          excluded: false,
          paymentMethod: 'Direct Deposit',
          memo: null,
          fixedCompensations: [],
          hourlyCompensations: [
            {
              flsaStatus: 'Nonexempt',
              name: 'Regular Hours',
              jobUuid: 'test-job-uuid',
              amount: '880.0',
              compensationMultiplier: 1.0,
              hours: '40.000',
            },
          ],
          employeeUuid: 'test-employee-uuid',
          version: 'test-version',
          paidTimeOff: [
            {
              name: 'Vacation Hours',
              hours: '0.0',
            },
          ],
          grossPay: 880.0,
          netPay: 767.99,
          checkAmount: 767.99,
        },
      ]}
      employeeDetails={[
        {
          uuid: 'test-employee-uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          companyUuid: 'test-company-uuid',
          managerUuid: null,
          version: 'test-version',
          currentEmploymentStatus: 'full_time',
          onboardingStatus: 'onboarding_completed',
          preferredFirstName: null,
          departmentUuid: 'test-department-uuid',
          employeeCode: 'JD001',
          paymentMethod: 'Direct Deposit',
          department: 'Engineering',
          terminated: false,
          twoPercentShareholder: false,
          onboarded: true,
          historical: false,
          hasSsn: true,
          onboardingDocumentsConfig: {
            uuid: null,
            i9Document: false,
          },
          jobs: [
            {
              uuid: 'test-job-uuid',
              version: 'test-version',
              employeeUuid: 'test-employee-uuid',
              currentCompensationUuid: 'test-compensation-uuid',
              paymentUnit: 'Hour',
              primary: true,
              twoPercentShareholder: false,
              stateWcCovered: null,
              stateWcClassCode: null,
              title: 'Software Engineer',
              compensations: [
                {
                  uuid: 'test-compensation-uuid',
                  employeeUuid: 'test-employee-uuid',
                  version: 'test-version',
                  paymentUnit: 'Hour',
                  flsaStatus: 'Nonexempt',
                  adjustForMinimumWage: false,
                  minimumWages: [],
                  jobUuid: 'test-job-uuid',
                  effectiveDate: '2025-01-01',
                  rate: '22.00',
                },
              ],
              rate: '22.00',
              hireDate: '2024-01-01',
            },
          ],
          eligiblePaidTimeOff: [],
          terminations: [],
          garnishments: [],
          dateOfBirth: '1990-01-01',
          ssn: '',
          phone: null,
          workEmail: null,
        },
      ]}
      payPeriod={{
        startDate: '2025-07-30',
        endDate: '2025-08-13',
        payScheduleUuid: 'test-pay-schedule-uuid',
      }}
      onCalculatePayroll={fn().mockName('on_calculate')}
      onEdit={fn().mockName('on_edit')}
      onToggleExclude={fn().mockName('on_toggle_exclude')}
      onViewBlockers={fn().mockName('on_view_blockers')}
      payrollBlockers={mockBlockers}
    />
  )
}

export const WithLatePayrollBanner = () => {
  return (
    <PayrollConfigurationPresentation
      employeeCompensations={[
        {
          excluded: false,
          paymentMethod: 'Direct Deposit',
          memo: null,
          fixedCompensations: [],
          hourlyCompensations: [
            {
              flsaStatus: 'Nonexempt',
              name: 'Regular Hours',
              jobUuid: 'test-job-uuid',
              amount: '880.0',
              compensationMultiplier: 1.0,
              hours: '40.000',
            },
          ],
          employeeUuid: 'test-employee-uuid',
          version: 'test-version',
          paidTimeOff: [],
          grossPay: 880.0,
          netPay: 767.99,
          checkAmount: 767.99,
        },
      ]}
      employeeDetails={[
        {
          uuid: 'test-employee-uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          companyUuid: 'test-company-uuid',
          managerUuid: null,
          version: 'test-version',
          currentEmploymentStatus: 'full_time',
          onboardingStatus: 'onboarding_completed',
          preferredFirstName: null,
          departmentUuid: 'test-department-uuid',
          employeeCode: 'JD001',
          paymentMethod: 'Direct Deposit',
          department: 'Engineering',
          terminated: false,
          twoPercentShareholder: false,
          onboarded: true,
          historical: false,
          hasSsn: true,
          onboardingDocumentsConfig: {
            uuid: null,
            i9Document: false,
          },
          jobs: [
            {
              uuid: 'test-job-uuid',
              version: 'test-version',
              employeeUuid: 'test-employee-uuid',
              currentCompensationUuid: 'test-compensation-uuid',
              paymentUnit: 'Hour',
              primary: true,
              twoPercentShareholder: false,
              stateWcCovered: null,
              stateWcClassCode: null,
              title: 'Software Engineer',
              compensations: [
                {
                  uuid: 'test-compensation-uuid',
                  employeeUuid: 'test-employee-uuid',
                  version: 'test-version',
                  paymentUnit: 'Hour',
                  flsaStatus: 'Nonexempt',
                  adjustForMinimumWage: false,
                  minimumWages: [],
                  jobUuid: 'test-job-uuid',
                  effectiveDate: '2025-01-01',
                  rate: '22.00',
                },
              ],
              rate: '22.00',
              hireDate: '2024-01-01',
            },
          ],
          eligiblePaidTimeOff: [],
          terminations: [],
          garnishments: [],
          dateOfBirth: '1990-01-01',
          ssn: '',
          phone: null,
          workEmail: null,
        },
      ]}
      payPeriod={{
        startDate: '2025-07-30',
        endDate: '2025-08-13',
        payScheduleUuid: 'test-pay-schedule-uuid',
      }}
      onCalculatePayroll={fn().mockName('on_calculate')}
      onEdit={fn().mockName('on_edit')}
      onToggleExclude={fn().mockName('on_toggle_exclude')}
      onViewBlockers={fn().mockName('on_view_blockers')}
      payrollLateNotice={{
        label: 'Your original pay date was Fri, Dec 5',
        content:
          'Run payroll before 4:00 PM PST on Fri, Jan 16 to pay your employees on Wed, Jan 21.',
      }}
      payrollDeadlineNotice={{
        label:
          "To pay your employees with direct deposit by Wed, Jan 21, you'll need to run payroll by 4:00 PM PST on Fri, Jan 16.",
        content: 'Make sure to submit before the deadline to ensure timely payments.',
      }}
    />
  )
}
