import { fn } from 'storybook/test'
import { EmployeePaymentMethod1 } from '@gusto/embedded-api/models/components/employee'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollCategory } from '../payrollTypes'
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
          grossPay: '880.0',
          netPay: '767.99',
          checkAmount: '767.99',
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
          grossPay: '880.0',
          netPay: '767.99',
          checkAmount: '767.99',
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
          grossPay: '880.0',
          netPay: '767.99',
          checkAmount: '767.99',
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
      payrollAlert={{
        label: 'Your original pay date was Fri, Dec 5',
        content:
          'Run payroll before 4:00 PM PST on Fri, Jan 16 to pay your employees on Wed, Jan 21.',
        variant: 'warning',
      }}
    />
  )
}

export const DismissalWithUnusedHours = () => (
  <PayrollConfigurationPresentation
    payrollCategory={PayrollCategory.Dismissal}
    employeeCompensations={[
      {
        excluded: false,
        employeeUuid: 'test-employee-uuid',
        paymentMethod: 'Direct Deposit',
        fixedCompensations: [],
        hourlyCompensations: [
          {
            name: 'Regular Hours',
            hours: '32.000',
            flsaStatus: 'Nonexempt',
            jobUuid: 'test-job-uuid',
            amount: '704.0',
            compensationMultiplier: 1.0,
          },
        ],
        paidTimeOff: [
          { name: 'Vacation Hours', hours: '8.0', finalPayoutUnusedHoursInput: '40.0' },
          { name: 'Sick Hours', hours: '0.0', finalPayoutUnusedHoursInput: '0.0' },
        ],
      },
    ]}
    employeeDetails={[
      {
        uuid: 'test-employee-uuid',
        firstName: 'John',
        lastName: 'Doe',
        paymentMethod: EmployeePaymentMethod1.DirectDeposit,
        jobs: [
          {
            uuid: 'test-job-uuid',
            title: 'Software Engineer',
            primary: true,
            compensations: [
              {
                uuid: 'test-compensation-uuid',
                rate: '22.00',
                paymentUnit: 'Hour',
                flsaStatus: 'Nonexempt',
              },
            ],
          },
        ],
      },
    ]}
    onCalculatePayroll={fn().mockName('on_calculate')}
    onEdit={fn().mockName('on_edit')}
    onToggleExclude={fn().mockName('on_toggle_exclude')}
    onViewBlockers={fn().mockName('on_view_blockers')}
  />
)
