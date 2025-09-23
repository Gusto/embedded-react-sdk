import { action } from '@ladle/react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'

export default {
  title: 'Domain/Payroll/PayrollEditEmployee',
}

const mockEmployee: Employee = {
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
  ssn: '123-45-6789',
}

const mockEmployeeCompensation: PayrollEmployeeCompensationsType = {
  excluded: false,
  employeeUuid: 'test-employee-uuid',
  hourlyCompensations: [
    {
      name: 'Regular Hours',
      hours: '40.000',
      flsaStatus: 'Nonexempt',
      jobUuid: 'test-job-uuid',
      amount: '880.0',
      compensationMultiplier: 1.0,
    },
  ],
  paidTimeOff: [
    {
      name: 'Vacation Hours',
      hours: '8.0',
    },
  ],
  grossPay: 880.0,
  fixedCompensations: [],
  paymentMethod: 'Direct Deposit',
  memo: null,
  version: 'v1',
  netPay: 767.99,
  checkAmount: 767.99,
}

export const Default = () => {
  return (
    <PayrollEditEmployeePresentation
      onSave={action('save')}
      onCancel={action('cancel')}
      employee={mockEmployee}
      employeeCompensation={mockEmployeeCompensation}
      grossPay={880.0}
      fixedCompensationTypes={[]}
    />
  )
}
