import { action } from '@ladle/react'
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
      onBack={action('on_back')}
      onCalculatePayroll={action('on_calculate')}
      onEdit={action('on_edit')}
    />
  )
}
