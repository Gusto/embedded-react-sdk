import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import type { PrototypeConfiguration } from '../../../prototypes/prototypeTypes'
import { PayrollConfigurationRropDemo } from './PayrollConfigurationRropStates'

const PRIMARY_JOB_UUID = 'job-primary'

interface BuildEmployeeOverrides {
  uuid: string
  firstName: string
  lastName: string
  flsaStatus?: string
  paymentUnit?: string
  rate?: string
  title?: string
  eligiblePtoNames?: string[]
}

function buildEmployee(overrides: BuildEmployeeOverrides): Employee {
  const flsaStatus = overrides.flsaStatus ?? 'Nonexempt'
  const paymentUnit = overrides.paymentUnit ?? 'Hour'
  const rate = overrides.rate ?? '60'
  const title = overrides.title ?? 'Software Engineer'
  return {
    uuid: overrides.uuid,
    firstName: overrides.firstName,
    lastName: overrides.lastName,
    jobs: [
      {
        uuid: PRIMARY_JOB_UUID,
        version: 'job-version',
        employeeUuid: overrides.uuid,
        primary: true,
        title,
        rate,
        paymentUnit,
        hireDate: '2024-01-15',
        twoPercentShareholder: false,
        compensations: [
          {
            uuid: 'comp-primary',
            version: 'comp-version',
            paymentUnit,
            flsaStatus,
            adjustForMinimumWage: false,
            jobUuid: PRIMARY_JOB_UUID,
            title,
            effectiveDate: '2024-01-15',
            rate,
          },
        ],
      },
    ],
    eligiblePaidTimeOff: (overrides.eligiblePtoNames ?? ['Sick Hours', 'Vacation Hours']).map(
      name => ({
        name,
        accrualUnit: 'Hour',
        accrualBalance: '40.0',
        accrualMethod: 'per_pay_period',
      }),
    ),
  } as Employee
}

interface BuildCompensationOverrides {
  employeeUuid: string
  regularHours?: string
  overtime?: string
  doubleOvertime?: string
  bonus?: string
  cashTips?: string
  paycheckTips?: string
  commission?: string
  correctionPayment?: string
  sickHours?: string
  vacationHours?: string
}

function buildCompensation(overrides: BuildCompensationOverrides): EmployeeCompensations {
  return {
    employeeUuid: overrides.employeeUuid,
    excluded: false,
    paymentMethod: 'Direct Deposit',
    hourlyCompensations: [
      {
        name: 'Regular Hours',
        hours: overrides.regularHours ?? '40.0',
        jobUuid: PRIMARY_JOB_UUID,
        compensationMultiplier: 1,
      },
      {
        name: 'Overtime',
        hours: overrides.overtime ?? '0.0',
        jobUuid: PRIMARY_JOB_UUID,
        compensationMultiplier: 1.5,
      },
      {
        name: 'Double overtime',
        hours: overrides.doubleOvertime ?? '0.0',
        jobUuid: PRIMARY_JOB_UUID,
        compensationMultiplier: 2,
      },
    ],
    paidTimeOff: [
      { name: 'Sick Hours', hours: overrides.sickHours ?? '0.0' },
      { name: 'Vacation Hours', hours: overrides.vacationHours ?? '0.0' },
    ],
    fixedCompensations: [
      { name: 'Bonus', amount: overrides.bonus ?? '0.00', jobUuid: PRIMARY_JOB_UUID },
      { name: 'Cash Tips', amount: overrides.cashTips ?? '0.00', jobUuid: PRIMARY_JOB_UUID },
      {
        name: 'Paycheck Tips',
        amount: overrides.paycheckTips ?? '0.00',
        jobUuid: PRIMARY_JOB_UUID,
      },
      { name: 'Commission', amount: overrides.commission ?? '0.00', jobUuid: PRIMARY_JOB_UUID },
      {
        name: 'Correction Payment',
        amount: overrides.correctionPayment ?? '0.00',
        jobUuid: PRIMARY_JOB_UUID,
      },
    ],
    reimbursements: [],
  } as EmployeeCompensations
}

const payPeriod = {
  startDate: '2025-01-06',
  endDate: '2025-01-19',
  payDate: '2025-01-24',
} as PayrollPayPeriodType

const paySchedule = {
  uuid: 'pay-schedule-1',
  frequency: 'Every other week',
  anchorPayDate: '2025-01-03',
  anchorEndOfPayPeriod: '2025-01-02',
  day1: null,
  day2: null,
  name: 'Bi-weekly',
} as unknown as PayScheduleShow

const fixedCompensationTypes: PayrollFixedCompensationTypesType[] = [
  { name: 'Bonus' },
  { name: 'Cash Tips' },
  { name: 'Paycheck Tips' },
  { name: 'Commission' },
  { name: 'Correction Payment' },
]

const employees: Employee[] = [
  buildEmployee({ uuid: 'employee-1', firstName: 'Alex', lastName: 'Rivera' }),
  buildEmployee({
    uuid: 'employee-2',
    firstName: 'Sam',
    lastName: 'Tanaka',
    eligiblePtoNames: ['Vacation Hours'],
  }),
  buildEmployee({
    uuid: 'employee-3',
    firstName: 'Jordan',
    lastName: 'Lee',
    title: 'Engineering Manager',
    flsaStatus: 'Exempt',
    paymentUnit: 'Year',
    rate: '120000',
  }),
]

const compensations: EmployeeCompensations[] = [
  buildCompensation({
    employeeUuid: 'employee-1',
    regularHours: '40.0',
    bonus: '500.00',
    paycheckTips: '120.00',
  }),
  buildCompensation({
    employeeUuid: 'employee-2',
    regularHours: '32.0',
    overtime: '4.0',
    vacationHours: '8.0',
    commission: '250.00',
  }),
  buildCompensation({
    employeeUuid: 'employee-3',
    regularHours: '0.0',
    sickHours: '0.0',
    vacationHours: '0.0',
    bonus: '1000.00',
  }),
]

export const payrollConfigurationRropConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'default',
    name: 'Default',
    description:
      'Three employees: one nonexempt hourly, one part-time hourly missing Sick PTO eligibility, and one exempt salaried employee with hours columns showing N/A.',
    render: () => (
      <PayrollConfigurationRropDemo
        employeeCompensations={compensations}
        employeeDetails={employees}
        fixedCompensationTypes={fixedCompensationTypes}
        payPeriod={payPeriod}
        paySchedule={paySchedule}
      />
    ),
  },
  {
    slug: 'rrop',
    name: 'Regular rate of pay',
    description:
      'Same three employees, but the spreadsheet runs in RRoP mode — clicking an applicable Overtime or Double overtime cell opens a per-workweek breakdown modal.',
    render: () => (
      <PayrollConfigurationRropDemo
        employeeCompensations={compensations}
        employeeDetails={employees}
        fixedCompensationTypes={fixedCompensationTypes}
        payPeriod={payPeriod}
        paySchedule={paySchedule}
        rrop
      />
    ),
  },
]
