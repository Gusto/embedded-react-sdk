import type { Employee } from '@gusto/embedded-api-v-2026-06-15/models/components/employee'
import type {
  PayrollEmployeeCompensationsType,
  PaidTimeOff,
  FixedCompensations,
  HourlyCompensations,
  Reimbursements,
} from '@gusto/embedded-api-v-2026-06-15/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod } from '@gusto/embedded-api-v-2026-06-15/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2026-06-15/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleShow } from '@gusto/embedded-api-v-2026-06-15/models/components/payscheduleshow'
import type { PrototypeConfiguration } from '../../../prototypes/prototypeTypes'
import type { WorkweekRange } from './PayrollEditEmployeePresentation'
import { PayrollEditEmployeeDemo } from './PayrollEditEmployeeStates'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'

const PRIMARY_JOB_UUID = 'job-primary'
const SECONDARY_JOB_UUID = 'job-secondary'

function buildEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    uuid: 'employee-1',
    firstName: 'Alex',
    lastName: 'Rivera',
    jobs: [
      {
        uuid: PRIMARY_JOB_UUID,
        version: 'job-version',
        employeeUuid: 'employee-1',
        primary: true,
        title: 'Software Engineer',
        rate: '60',
        paymentUnit: 'Hour',
        hireDate: '2024-01-15',
        twoPercentShareholder: false,
        compensations: [
          {
            uuid: 'comp-primary',
            version: 'comp-version',
            paymentUnit: 'Hour',
            flsaStatus: 'Nonexempt',
            adjustForMinimumWage: false,
            jobUuid: PRIMARY_JOB_UUID,
            title: 'Software Engineer',
            effectiveDate: '2024-01-15',
            rate: '60',
          },
        ],
      },
    ],
    eligiblePaidTimeOff: [
      {
        name: 'Vacation Hours',
        accrualUnit: 'Hour',
        accrualBalance: '40.0',
        accrualMethod: 'per_pay_period',
      },
      {
        name: 'Sick Hours',
        accrualUnit: 'Hour',
        accrualBalance: '24.0',
        accrualMethod: 'per_pay_period',
      },
    ],
    ...overrides,
  } as Employee
}

function buildHourly(overrides: Partial<HourlyCompensations> = {}): HourlyCompensations {
  return {
    name: 'Regular Hours',
    hours: '40.0',
    jobUuid: PRIMARY_JOB_UUID,
    compensationMultiplier: 1,
    ...overrides,
  } as HourlyCompensations
}

function buildTimeOff(overrides: Partial<PaidTimeOff> = {}): PaidTimeOff {
  return {
    name: 'Vacation Hours',
    hours: '0.000',
    ...overrides,
  } as PaidTimeOff
}

function buildFixed(overrides: Partial<FixedCompensations> = {}): FixedCompensations {
  return {
    name: 'Bonus',
    amount: '0.00',
    jobUuid: PRIMARY_JOB_UUID,
    ...overrides,
  } as FixedCompensations
}

const fixedCompensationTypes: PayrollFixedCompensationTypesType[] = [
  { name: 'Bonus' },
  { name: 'Commission' },
  { name: 'Paycheck Tips' },
  { name: 'Cash Tips' },
  { name: 'Correction Payment' },
  { name: 'Reimbursement' },
]

const paySchedule = {
  uuid: 'pay-schedule-1',
  frequency: 'Every other week',
  anchorPayDate: '2025-01-03',
  anchorEndOfPayPeriod: '2025-01-02',
  day1: null,
  day2: null,
  name: 'Bi-weekly',
} as unknown as PayScheduleShow

const PAY_PERIOD_START_DATE = '2025-01-06'

const baseCompensation: PayrollEmployeeCompensationsType = {
  employeeUuid: 'employee-1',
  paymentMethod: PayrollEmployeeCompensationsTypePaymentMethod.DirectDeposit,
  excluded: false,
  hourlyCompensations: [
    buildHourly({ name: 'Regular Hours', hours: '40.0' }),
    buildHourly({ name: 'Overtime', hours: '0.0' }),
    buildHourly({ name: 'Double overtime', hours: '0.0' }),
  ],
  paidTimeOff: [buildTimeOff({ name: 'Vacation Hours' }), buildTimeOff({ name: 'Sick Hours' })],
  fixedCompensations: [],
  reimbursements: [],
} as PayrollEmployeeCompensationsType

const multiJobEmployee = buildEmployee({
  jobs: [
    {
      uuid: PRIMARY_JOB_UUID,
      version: 'job-version',
      employeeUuid: 'employee-1',
      primary: true,
      title: 'Server',
      rate: '20',
      paymentUnit: 'Hour',
      hireDate: '2024-01-15',
      twoPercentShareholder: false,
      compensations: [
        {
          uuid: 'comp-primary',
          version: 'comp-version',
          paymentUnit: 'Hour',
          flsaStatus: 'Nonexempt',
          adjustForMinimumWage: false,
          jobUuid: PRIMARY_JOB_UUID,
          title: 'Server',
          effectiveDate: '2024-01-15',
          rate: '20',
        },
      ],
    },
    {
      uuid: SECONDARY_JOB_UUID,
      version: 'job-version-2',
      employeeUuid: 'employee-1',
      primary: false,
      title: 'Bartender',
      rate: '24',
      paymentUnit: 'Hour',
      hireDate: '2024-06-01',
      twoPercentShareholder: false,
      compensations: [
        {
          uuid: 'comp-secondary',
          version: 'comp-version-2',
          paymentUnit: 'Hour',
          flsaStatus: 'Nonexempt',
          adjustForMinimumWage: false,
          jobUuid: SECONDARY_JOB_UUID,
          title: 'Bartender',
          effectiveDate: '2024-06-01',
          rate: '24',
        },
      ],
    },
  ] as Employee['jobs'],
})

const multiJobCompensation: PayrollEmployeeCompensationsType = {
  ...baseCompensation,
  hourlyCompensations: [
    buildHourly({ name: 'Regular Hours', hours: '32.0', jobUuid: PRIMARY_JOB_UUID }),
    buildHourly({ name: 'Overtime', hours: '0.0', jobUuid: PRIMARY_JOB_UUID }),
    buildHourly({ name: 'Regular Hours', hours: '16.0', jobUuid: SECONDARY_JOB_UUID }),
    buildHourly({ name: 'Overtime', hours: '0.0', jobUuid: SECONDARY_JOB_UUID }),
  ],
} as PayrollEmployeeCompensationsType

const withAdditionalEarnings: PayrollEmployeeCompensationsType = {
  ...baseCompensation,
  fixedCompensations: [
    buildFixed({ name: 'Bonus', amount: '500.00' }),
    buildFixed({ name: 'Paycheck Tips', amount: '120.00' }),
  ],
} as PayrollEmployeeCompensationsType

const withItemizedReimbursements: PayrollEmployeeCompensationsType = {
  ...baseCompensation,
  reimbursements: [
    {
      uuid: 'reimb-1',
      amount: '45.50',
      description: 'Client lunch',
      recurring: false,
    } as Reimbursements,
    {
      uuid: 'reimb-2',
      amount: '99.00',
      description: 'Phone stipend',
      recurring: true,
    } as Reimbursements,
  ],
} as PayrollEmployeeCompensationsType

const RROP_WORKWEEKS: WorkweekRange[] = [{ label: 'Jan 6 – Jan 12' }, { label: 'Jan 13 – Jan 19' }]

const rropWithEarnings: PayrollEmployeeCompensationsType = {
  ...baseCompensation,
  fixedCompensations: [
    buildFixed({ name: 'Bonus', amount: '0.00' }),
    buildFixed({ name: 'Commission', amount: '0.00' }),
    buildFixed({ name: 'Correction Payment', amount: '0.00' }),
    buildFixed({ name: 'Paycheck Tips', amount: '0.00' }),
  ],
} as PayrollEmployeeCompensationsType

const rropOvertimeRevealed: PayrollEmployeeCompensationsType = {
  ...rropWithEarnings,
  hourlyCompensations: [
    buildHourly({ name: 'Regular Hours', hours: '40.0' }),
    buildHourly({ name: 'Overtime', hours: '4.0' }),
    buildHourly({ name: 'Double overtime', hours: '0.0' }),
  ],
} as PayrollEmployeeCompensationsType

const exemptEmployee = buildEmployee({
  jobs: [
    {
      uuid: PRIMARY_JOB_UUID,
      version: 'job-version',
      employeeUuid: 'employee-1',
      primary: true,
      title: 'Engineering Manager',
      rate: '120000',
      paymentUnit: 'Year',
      hireDate: '2024-01-15',
      twoPercentShareholder: false,
      compensations: [
        {
          uuid: 'comp-primary',
          version: 'comp-version',
          paymentUnit: 'Year',
          flsaStatus: 'Exempt',
          adjustForMinimumWage: false,
          jobUuid: PRIMARY_JOB_UUID,
          title: 'Engineering Manager',
          effectiveDate: '2024-01-15',
          rate: '120000',
        },
      ],
    },
  ] as Employee['jobs'],
})

const defaultEmployee = buildEmployee()

export const payrollEditEmployeeConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'regular-hourly',
    name: 'Regular — hourly',
    description: 'Standard regular payroll for an hourly employee with PTO accruals.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={baseCompensation}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
      />
    ),
  },
  {
    slug: 'multi-job',
    name: 'Multi-job',
    description: 'Hourly employee with two active jobs; separate hours per job.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={multiJobEmployee}
        employeeCompensation={multiJobCompensation}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
      />
    ),
  },
  {
    slug: 'with-additional-earnings',
    name: 'With additional earnings',
    description: 'Includes bonus and tips as fixed compensations.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={withAdditionalEarnings}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
      />
    ),
  },
  {
    slug: 'with-reimbursements',
    name: 'With reimbursements',
    description: 'Itemized reimbursements including a recurring one.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={withItemizedReimbursements}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
      />
    ),
  },
  {
    slug: 'dismissal',
    name: 'Dismissal payroll',
    description: 'Off-cycle dismissal — adds the final payout section.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={baseCompensation}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        payrollCategory={PayrollCategory.Dismissal}
      />
    ),
  },
  {
    slug: 'bonus-off-cycle',
    name: 'Off-cycle (bonus)',
    description: 'Off-cycle bonus payroll — uses the legacy reimbursement field.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={baseCompensation}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        payrollCategory={PayrollCategory.Bonus}
      />
    ),
  },
  {
    slug: 'no-direct-deposit',
    name: 'No direct deposit',
    description: 'Employee has no bank accounts on file — payment method picker hidden.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={baseCompensation}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        hasDirectDepositSetup={false}
      />
    ),
  },
  {
    slug: 'rrop-overtime-hourly',
    name: 'RRoP — hourly, OT hidden',
    description:
      'OT-eligible (Nonexempt) hourly with RRoP enabled. Overtime starts hidden behind "Add overtime"; clicking it reveals OT rows AND splits Hours + Additional earnings into per-workweek columns. Tips (Other) remain single-column.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={rropWithEarnings}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        isRropEnabled
        workweeks={RROP_WORKWEEKS}
      />
    ),
  },
  {
    slug: 'rrop-overtime-revealed',
    name: 'RRoP — overtime already entered',
    description:
      'Same fixture as above but with overtime hours pre-filled, so the workweek split renders on first paint.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={defaultEmployee}
        employeeCompensation={rropOvertimeRevealed}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        isRropEnabled
        workweeks={RROP_WORKWEEKS}
      />
    ),
  },
  {
    slug: 'rrop-exempt-no-split',
    name: 'RRoP — exempt employee (no split)',
    description:
      'Exempt salaried employee with RRoP enabled. OT-eligibility gate prevents the split — single-column inputs even after revealing overtime.',
    render: () => (
      <PayrollEditEmployeeDemo
        employee={exemptEmployee}
        employeeCompensation={rropWithEarnings}
        fixedCompensationTypes={fixedCompensationTypes}
        paySchedule={paySchedule}
        payPeriodStartDate={PAY_PERIOD_START_DATE}
        isRropEnabled
        workweeks={RROP_WORKWEEKS}
      />
    ),
  },
]
