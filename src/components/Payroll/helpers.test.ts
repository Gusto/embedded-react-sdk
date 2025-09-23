import { expect, describe, it } from 'vitest'
import {
  formatEmployeePayRate,
  getRegularHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
  formatHoursDisplay,
  calculateGrossPay,
  getPayrollType,
  getPayrollStatus,
  getAdditionalEarningsCompensations,
  getReimbursementCompensation,
} from './helpers'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  EmployeeCompensations,
  PayrollShowPaidTimeOff,
} from '@gusto/embedded-api/models/components/payrollshow'
import { PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import { PayScheduleFrequency } from '@gusto/embedded-api/models/components/payschedulefrequency'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { TFunction } from 'i18next'
import { Job } from '@gusto/embedded-api/models/components/job.js'
import {
  FixedCompensations,
  HourlyCompensations,
} from '@gusto/embedded-api/models/components/payrollemployeecompensationstype.js'

describe('Payroll helpers', () => {
  describe('formatEmployeePayRate', () => {
    const mockT = ((key: string, options?: { amount?: string; ns?: string }) => {
      const templates = {
        'payRateFormats.hourly': '{{amount}}/hr',
        'payRateFormats.weekly': '{{amount}}/yr',
        'payRateFormats.monthly': '{{amount}}/yr',
        'payRateFormats.yearly': '{{amount}}/yr',
        'payRateFormats.paycheck': '{{amount}}/paycheck',
      }
      const template = templates[key as keyof typeof templates] || key
      return options?.amount ? template.replace('{{amount}}', options.amount) : template
    }) as TFunction

    it('should return null when employee has no jobs', () => {
      const employee = {} as Employee
      expect(formatEmployeePayRate({ employee, t: mockT })).toBeNull()
    })

    it('should return null when job has no compensations', () => {
      const employee = {
        uuid: '123',
        firstName: 'Jane',
        lastName: 'Johnson',
        jobs: [{ uuid: '234', primary: true, compensations: [] }],
      }
      expect(formatEmployeePayRate({ employee, t: mockT })).toBeNull()
    })

    it('should return "0" when rate is 0', () => {
      const employee = {
        uuid: '123',
        firstName: 'Jane',
        lastName: 'Johnson',
        jobs: [
          {
            primary: true,
            compensations: [{ rate: '0', paymentUnit: PaymentUnit.Hour, uuid: '345' }],
            uuid: '234',
          },
        ],
      }
      expect(formatEmployeePayRate({ employee, t: mockT })).toBeNull()
    })

    it('should format hourly rate correctly', () => {
      const employee = {
        uuid: '123',
        firstName: 'Jane',
        lastName: 'Johnson',
        jobs: [
          {
            primary: true,
            compensations: [{ rate: '25.50', paymentUnit: PaymentUnit.Hour, uuid: '345' }],
            uuid: '234',
          },
        ],
      }
      expect(formatEmployeePayRate({ employee, t: mockT })).toBe('$25.50/hr')
    })

    it('should use first job if no primary job found', () => {
      const employee = {
        uuid: '123',
        firstName: 'Jane',
        lastName: 'Johnson',
        jobs: [
          {
            primary: false,
            compensations: [{ rate: '30.00', paymentUnit: PaymentUnit.Hour, uuid: '345' }],
            uuid: '234',
          },
        ],
      }
      expect(formatEmployeePayRate({ employee, t: mockT })).toBe('$30.00/hr')
    })

    it('should default to Hour payment unit', () => {
      const employee = {
        uuid: '123',
        firstName: 'Jane',
        lastName: 'Johnson',
        jobs: [
          {
            primary: true,
            compensations: [{ rate: '20.00', paymentUnit: PaymentUnit.Hour, uuid: '345' }],
            uuid: '234',
          },
        ],
      }
      expect(formatEmployeePayRate({ employee, t: mockT })).toBe('$20.00/hr')
    })
  })

  describe('getRegularHours', () => {
    it('should return 0 when no hourly compensations', () => {
      const compensation = {} as EmployeeCompensations
      expect(getRegularHours(compensation)).toBe(0)
    })

    it('should sum regular hours correctly across multiple entries', () => {
      const compensation = {
        hourlyCompensations: [
          { name: 'Regular Hours', hours: '32.0' },
          { name: 'Overtime', hours: '8.0' },
          { name: 'Regular Hours', hours: '8.0' },
          { name: 'Holiday Pay', hours: '8.0' },
          { name: 'Regular Hours', hours: '4.0' },
        ],
      }

      expect(getRegularHours(compensation)).toBe(44)
    })

    it('should handle missing hours gracefully', () => {
      const compensation = {
        hourlyCompensations: [{ name: 'Regular Hours', hours: undefined }],
      }
      expect(getRegularHours(compensation)).toBe(0)
    })
  })

  describe('getTotalPtoHours', () => {
    it('should return 0 when no paid time off', () => {
      const compensation = {}
      expect(getTotalPtoHours(compensation)).toBe(0)
    })

    it('should sum all PTO hours correctly', () => {
      const compensation = {
        paidTimeOff: [
          { name: 'Vacation', hours: '8.0' },
          { name: 'Sick', hours: '4.0' },
        ],
      }
      expect(getTotalPtoHours(compensation)).toBe(12)
    })

    it('should handle missing hours gracefully', () => {
      const compensation = {
        paidTimeOff: [
          { name: 'Vacation', hours: undefined },
          { name: 'Sick', hours: '2.0' },
        ],
      }
      expect(getTotalPtoHours(compensation)).toBe(2)
    })
  })

  describe('getAdditionalEarnings', () => {
    it('should return 0 when no fixed compensations', () => {
      const compensation = {}
      expect(getAdditionalEarnings(compensation)).toBe(0)
    })

    it('should exclude reimbursements and minimum wage adjustment', () => {
      const compensation = {
        fixedCompensations: [
          { name: 'Bonus', amount: '500.00' },
          { name: 'Reimbursement', amount: '100.00' },
          { name: 'Minimum Wage Adjustment', amount: '50.00' },
        ],
      }
      expect(getAdditionalEarnings(compensation)).toBe(500)
    })

    it('should only include positive amounts', () => {
      const compensation = {
        fixedCompensations: [
          { name: 'Bonus', amount: '500.00' },
          { name: 'Deduction', amount: '-100.00' },
        ],
      }
      expect(getAdditionalEarnings(compensation)).toBe(500)
    })

    it('should handle case-insensitive name matching', () => {
      const compensation = {
        fixedCompensations: [
          { name: 'REIMBURSEMENT', amount: '100.00' },
          { name: 'Bonus', amount: '200.00' },
        ],
      } as EmployeeCompensations
      expect(getAdditionalEarnings(compensation)).toBe(200)
    })
  })

  describe('getReimbursements', () => {
    it('should return 0 when no fixed compensations', () => {
      const compensation = {} as EmployeeCompensations
      expect(getReimbursements(compensation)).toBe(0)
    })

    it('should find and return reimbursement amount', () => {
      const compensation = {
        fixedCompensations: [
          { name: 'Bonus', amount: '500.00' },
          { name: 'Reimbursement', amount: '100.00' },
        ],
      } as EmployeeCompensations
      expect(getReimbursements(compensation)).toBe(100)
    })

    it('should handle case-insensitive name matching', () => {
      const compensation = {
        fixedCompensations: [{ name: 'REIMBURSEMENT', amount: '75.50' }],
      } as EmployeeCompensations
      expect(getReimbursements(compensation)).toBe(75.5)
    })

    it('should return 0 when no reimbursement found', () => {
      const compensation = {
        fixedCompensations: [{ name: 'Bonus', amount: '500.00' }],
      } as EmployeeCompensations
      expect(getReimbursements(compensation)).toBe(0)
    })

    it('should handle missing amount gracefully', () => {
      const compensation = {
        fixedCompensations: [{ name: 'Reimbursement', amount: undefined }],
      } as EmployeeCompensations
      expect(getReimbursements(compensation)).toBe(0)
    })
  })

  describe('formatHoursDisplay', () => {
    it('should format whole numbers with trailing .0', () => {
      expect(formatHoursDisplay(40)).toBe('40.0')
      expect(formatHoursDisplay(0)).toBe('0.0')
    })

    it('should preserve numbers with 1-2 decimal places', () => {
      expect(formatHoursDisplay(40.2)).toBe('40.2')
      expect(formatHoursDisplay(30.75)).toBe('30.75')
    })

    it('should round numbers with 3+ decimal places', () => {
      expect(formatHoursDisplay(30.756)).toBe('30.76') // rounds up
      expect(formatHoursDisplay(30.754)).toBe('30.75') // rounds down
      expect(formatHoursDisplay(40.999)).toBe('41.0') // rounds to whole number
    })

    it('should handle negative numbers', () => {
      expect(formatHoursDisplay(-40)).toBe('-40.0')
      expect(formatHoursDisplay(-30.756)).toBe('-30.76')
    })
  })
  describe('calculateGrossPay', () => {
    const compensationEffectiveDate = '2024-01-15'
    const jobUuid = 'job-123'
    const employeeUuid = 'employee-123'

    const createEmployee = (jobs: Job[]): Employee => ({
      uuid: employeeUuid,
      firstName: 'John',
      lastName: 'Doe',
      jobs,
    })

    const createPaySchedule = (
      frequency: PayScheduleFrequency = PayScheduleFrequency.EveryWeek,
    ): PayScheduleObject => ({
      uuid: 'pay-schedule-123',
      frequency,
      anchorPayDate: '2022-01-01',
      anchorEndOfPayPeriod: '2022-01-07',
      version: '2024-04-01',
    })

    const createEmployeeCompensation = (
      hourlyCompensations: HourlyCompensations[] = [],
      fixedCompensations: FixedCompensations[] = [],
      paidTimeOff: PayrollShowPaidTimeOff[] = [],
      excluded: boolean = false,
    ): EmployeeCompensations => ({
      employeeUuid,
      hourlyCompensations,
      fixedCompensations,
      paidTimeOff,
      excluded,
    })

    describe('when employee is hourly (non-exempt)', () => {
      const flsaStatus = FlsaStatusType.Nonexempt
      const jobs = [
        {
          uuid: jobUuid,
          primary: true,
          compensations: [
            {
              rate: '100.00',
              uuid: 'compensation-123',
              paymentUnit: PaymentUnit.Hour,
              flsaStatus,
              effectiveDate: '2022-01-01',
            },
          ],
        },
      ]

      it('calculates total pay correctly', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [
            { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '32.0' },
            { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '5.0' },
            { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '3.0' },
          ],
          [
            { name: 'Cash Tips', amount: '333.33' },
            { name: 'Reimbursement', amount: '100.00' },
          ],
          [
            { name: 'Sick', hours: '0' },
            { name: 'Vacation', hours: '8.0' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(5683.33)
      })

      it('calculates total pay correctly for off-cycle payroll', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [
            { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '32.0' },
            { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '5.0' },
            { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '3.0' },
          ],
          [
            { name: 'Cash Tips', amount: '333.33' },
            { name: 'Reimbursement', amount: '100.00' },
          ],
          [
            { name: 'Sick', hours: '0' },
            { name: 'Vacation', hours: '8.0' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
          true,
        )
        expect(result).toBe(5683.33)
      })

      describe('when employee has multiple jobs', () => {
        const secondJobUuid = 'job-456'
        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [
              {
                rate: '100.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: '2022-01-01',
              },
            ],
          },
          {
            uuid: secondJobUuid,
            primary: false,
            compensations: [
              {
                rate: '9.00',
                uuid: 'compensation-456',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: '2022-01-01',
              },
            ],
          },
        ]

        it('calculates total pay for multiple jobs', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [
              { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '32.0' },
              { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '5.0' },
              { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '3.0' },
              {
                name: 'Regular Hours',
                jobUuid: secondJobUuid,
                compensationMultiplier: 1.0,
                hours: '7.0',
              },
              {
                name: 'Overtime',
                jobUuid: secondJobUuid,
                compensationMultiplier: 1.5,
                hours: '8.0',
              },
              {
                name: 'Double Overtime',
                jobUuid: secondJobUuid,
                compensationMultiplier: 2.0,
                hours: '1.0',
              },
            ],
            [{ name: 'Cash Tips', amount: '333.33' }],
            [
              { name: 'Sick', hours: '0' },
              { name: 'Vacation', hours: '8.0' },
            ],
          )

          const result = calculateGrossPay(
            compensation,
            employee,
            compensationEffectiveDate,
            paySchedule,
          )
          // Expected: regular + weighted_rate * ot_hours + pto + cash tips
          // 4144 + 74 * (5 * 0.5 + 3 + 8 * 0.5 + 1) + 800 + 333.33
          expect(result).toBe(4144 + 74 * (5 * 0.5 + 3 + 8 * 0.5 + 1) + 800 + 333.33)
        })

        it('returns zero when all hours and compensations are zero', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [
              { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '0.0' },
              { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '0.0' },
              { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '0.0' },
              {
                name: 'Regular Hours',
                jobUuid: secondJobUuid,
                compensationMultiplier: 1.0,
                hours: '0.0',
              },
              {
                name: 'Overtime',
                jobUuid: secondJobUuid,
                compensationMultiplier: 1.5,
                hours: '0.0',
              },
              {
                name: 'Double Overtime',
                jobUuid: secondJobUuid,
                compensationMultiplier: 2.0,
                hours: '0.0',
              },
            ],
            [
              { name: 'Bonus', amount: '0.0' },
              { name: 'Reimbursement', amount: '0.0' },
            ],
            [],
          )

          const result = calculateGrossPay(
            compensation,
            employee,
            compensationEffectiveDate,
            paySchedule,
          )
          expect(result).toBe(0)
        })
      })

      describe('when employee is adjusted for minimum wage', () => {
        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [
              {
                rate: '5.0',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: '2022-01-01',
                adjustForMinimumWage: true,
                minimumWages: [{ wage: '15.0', effectiveDate: '2022-01-01' }],
              },
            ],
          },
        ]

        it('calculates minimum wage adjustment when tips are higher than minimum wage', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [
              { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40.0' },
              { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '4.0' },
              { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '0.0' },
            ],
            [
              { name: 'Cash Tips', amount: '535.33' },
              { name: 'Reimbursement', amount: '0.0' },
            ],
            [
              { name: 'Sick', hours: '0' },
              { name: 'Vacation', hours: '8.0' },
            ],
          )

          const result = calculateGrossPay(
            compensation,
            employee,
            compensationEffectiveDate,
            paySchedule,
          )
          // regular + OT + pto + cash tips + minimum wage adjustment
          // 200.0 + 30.0 + 40.0 + 535.33 + 0 = 805.33
          expect(result).toBe(805.33)
        })

        it('calculates minimum wage adjustment when tips are lower than minimum wage', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [
              { name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40.0' },
              { name: 'Overtime', jobUuid, compensationMultiplier: 1.5, hours: '4.0' },
              { name: 'Double Overtime', jobUuid, compensationMultiplier: 2.0, hours: '0.0' },
            ],
            [
              { name: 'Cash Tips', amount: '25.50' },
              { name: 'Reimbursement', amount: '0.0' },
            ],
            [
              { name: 'Sick', hours: '0' },
              { name: 'Vacation', hours: '8.0' },
            ],
          )

          const result = calculateGrossPay(
            compensation,
            employee,
            compensationEffectiveDate,
            paySchedule,
          )
          // regular + OT + pto + cash tips + minimum wage adjustment
          // 200.0 + 30.0 + 40.0 + 25.50 + (10.0 * 44 - 25.50) = 710.00
          expect(result).toBe(710.0)
        })
      })
    })

    describe('when employee is salaried (exempt)', () => {
      const flsaStatus = FlsaStatusType.Exempt
      const jobs = [
        {
          uuid: jobUuid,
          primary: true,
          compensations: [
            {
              rate: '100.00',
              uuid: 'compensation-123',
              paymentUnit: PaymentUnit.Hour,
              flsaStatus,
              effectiveDate: '2022-01-01',
            },
          ],
        },
      ]

      it('calculates total pay when regular hours match pay period total', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
          [{ name: 'Cash Tips', amount: '333.33' }],
          [
            { name: 'Sick', hours: '0' },
            { name: 'Vacation', hours: '8.0' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(4000.0 + 333.33)
      })

      it('pays PTO hours on top of pro-rated salary when regular hours differ', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '30' }],
          [{ name: 'Cash Tips', amount: '333.33' }],
          [
            { name: 'Sick', hours: '0' },
            { name: 'Vacation', hours: '8.0' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(3000.0 + 333.33 + 8 * 100)
      })

      it('pays PTO hours on top of pro-rated salary for off-cycle payroll', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
          [{ name: 'Cash Tips', amount: '333.33' }],
          [
            { name: 'Sick', hours: '0' },
            { name: 'Vacation', hours: '8.0' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
          true,
        )
        expect(result).toBe(4000.0 + 333.33 + 8 * 100)
      })

      describe('when there are multiple effective dated compensations', () => {
        const oneDayAgo = '2024-01-14'
        const sixtyDaysAgo = '2023-11-16'
        const oneYearAgo = '2023-01-15'

        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [
              {
                rate: '60.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: oneYearAgo,
              },
              {
                rate: '80.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: sixtyDaysAgo,
              },
              {
                rate: '100.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus,
                effectiveDate: oneDayAgo,
              },
            ],
          },
        ]

        it('calculates based on today by default', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
            [{ name: 'Cash Tips', amount: '333.33' }],
          )

          const result = calculateGrossPay(
            compensation,
            employee,
            compensationEffectiveDate,
            paySchedule,
          )
          expect(result).toBe(40 * 100 + 333.33)
        })

        it('uses appropriate compensation for 1 day ago', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
            [{ name: 'Cash Tips', amount: '333.33' }],
          )

          const result = calculateGrossPay(compensation, employee, oneDayAgo, paySchedule)
          expect(result).toBe(40 * 100 + 333.33)
        })

        it('uses appropriate compensation for 7 days ago', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
            [{ name: 'Cash Tips', amount: '333.33' }],
          )

          const sevenDaysAgo = '2024-01-08'
          const result = calculateGrossPay(compensation, employee, sevenDaysAgo, paySchedule)
          expect(result).toBe(40 * 80 + 333.33)
        })

        it('uses earliest compensation when date is prior to earliest effective date', () => {
          const employee = createEmployee(jobs)
          const paySchedule = createPaySchedule()
          const compensation = createEmployeeCompensation(
            [{ name: 'Regular Hours', jobUuid, compensationMultiplier: 1.0, hours: '40' }],
            [{ name: 'Cash Tips', amount: '333.33' }],
          )

          const fourHundredDaysAgo = '2022-12-11'
          const result = calculateGrossPay(compensation, employee, fourHundredDaysAgo, paySchedule)
          expect(result).toBe(40 * 60 + 333.33)
        })
      })
    })

    describe('when employee is owner', () => {
      const jobs = [
        {
          uuid: jobUuid,
          primary: true,
          compensations: [
            {
              rate: '1000.00',
              uuid: 'compensation-123',
              paymentUnit: PaymentUnit.Paycheck,
              flsaStatus: FlsaStatusType.Owner,
              effectiveDate: '2022-01-01',
            },
          ],
        },
      ]

      it('returns total pay without using rate in compensation', () => {
        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [],
          [
            { name: 'Reimbursement', amount: '101.01' },
            { name: "Owner's Draw", amount: '1010.10' },
          ],
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(1010.1)
      })
    })

    describe('when employee is excluded', () => {
      it('returns 0', () => {
        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [
              {
                rate: '100.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus: FlsaStatusType.SalariedNonexempt,
                effectiveDate: '2022-01-01',
              },
            ],
          },
        ]

        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation(
          [],
          [
            { name: 'Reimbursement', amount: '101.01' },
            { name: "Owner's Draw", amount: '1010.10' },
          ],
          [],
          true,
        )

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(0)
      })
    })

    describe('edge cases', () => {
      it('returns 0 when employee has no jobs', () => {
        const employee = createEmployee([])
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation()

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(0)
      })

      it('returns 0 when job has no compensations', () => {
        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [],
          },
        ]

        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation()

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(0)
      })

      it('returns 0 when no effective compensation found', () => {
        const jobs = [
          {
            uuid: jobUuid,
            primary: true,
            compensations: [
              {
                rate: '100.00',
                uuid: 'compensation-123',
                paymentUnit: PaymentUnit.Hour,
                flsaStatus: FlsaStatusType.Nonexempt,
                effectiveDate: '2025-01-01', // Future date
              },
            ],
          },
        ]

        const employee = createEmployee(jobs)
        const paySchedule = createPaySchedule()
        const compensation = createEmployeeCompensation()

        const result = calculateGrossPay(
          compensation,
          employee,
          compensationEffectiveDate,
          paySchedule,
        )
        expect(result).toBe(0)
      })
    })
  })

  describe('getPayrollType', () => {
    it('returns External when payroll is external', () => {
      const payroll = { external: true, offCycle: false }
      expect(getPayrollType(payroll)).toBe('External')
    })

    it('returns Off-Cycle when payroll is off-cycle but not external', () => {
      const payroll = { external: false, offCycle: true }
      expect(getPayrollType(payroll)).toBe('Off-Cycle')
    })

    it('returns Regular when payroll is neither external nor off-cycle', () => {
      const payroll = { external: false, offCycle: false }
      expect(getPayrollType(payroll)).toBe('Regular')
    })

    it('returns External when both external and off-cycle are true (external takes precedence)', () => {
      const payroll = { external: true, offCycle: true }
      expect(getPayrollType(payroll)).toBe('External')
    })

    it('returns Regular when properties are undefined', () => {
      const payroll = {}
      expect(getPayrollType(payroll)).toBe('Regular')
    })
  })

  describe('getPayrollStatus', () => {
    it('returns Unprocessed when payroll is not processed', () => {
      const payroll = { processed: false, checkDate: '2024-12-15' }
      expect(getPayrollStatus(payroll)).toBe('Unprocessed')
    })

    it('returns Paid when processed and check date has passed', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
      const payroll = { processed: true, checkDate: pastDate }
      expect(getPayrollStatus(payroll)).toBe('Paid')
    })

    it('returns Pending when processed but check date has not arrived', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
      const payroll = { processed: true, checkDate: futureDate }
      expect(getPayrollStatus(payroll)).toBe('Pending')
    })

    it('returns Pending when processed but check date is null', () => {
      const payroll = { processed: true, checkDate: null }
      expect(getPayrollStatus(payroll)).toBe('Pending')
    })

    it('returns Pending when processed but check date is undefined', () => {
      const payroll = { processed: true }
      expect(getPayrollStatus(payroll)).toBe('Pending')
    })

    it('returns Paid when check date is exactly today', () => {
      const today = new Date().toISOString().split('T')[0]
      const payroll = { processed: true, checkDate: today }
      expect(getPayrollStatus(payroll)).toBe('Paid')
    })

    it('handles edge case with invalid date format gracefully', () => {
      const payroll = { processed: true, checkDate: 'invalid-date' }
      // Invalid date will result in NaN comparison, should default to Pending
      expect(getPayrollStatus(payroll)).toBe('Pending')
    })
  })

  describe('getAdditionalEarningsCompensations', () => {
    const primaryJobUuid = 'job-123'
    const fixedCompensationTypes: PayrollFixedCompensationTypesType[] = [
      { name: 'Bonus' },
      { name: 'Commission' },
      { name: 'Paycheck Tips' },
      { name: 'Cash Tips' },
      { name: 'Correction Payment' },
      { name: 'Reimbursement' },
    ]

    it('returns existing compensations filtered and sorted when employee is owner', () => {
      const existingFixedCompensations = [
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Reimbursement', amount: '50.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Owner,
        existingFixedCompensations,
        primaryJobUuid,
        fixedCompensationTypes,
        excludedTypes: ['Reimbursement', "Owner's Draw", 'Minimum Wage Adjustment'],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
      ])
    })

    it('returns existing compensations when no primary job UUID', () => {
      const existingFixedCompensations = [
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations,
        primaryJobUuid: undefined,
        fixedCompensationTypes,
        excludedTypes: ['Reimbursement'],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
      ])
    })

    it('returns existing compensations when no fixed compensation types', () => {
      const existingFixedCompensations = [
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations,
        primaryJobUuid,
        fixedCompensationTypes: [],
        excludedTypes: ['Reimbursement'],
      })

      expect(result).toEqual([{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }])
    })

    it('creates missing compensations for non-owner employees', () => {
      const existingFixedCompensations = [
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations,
        primaryJobUuid,
        fixedCompensationTypes,
        excludedTypes: ['Reimbursement', "Owner's Draw", 'Minimum Wage Adjustment'],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Cash Tips', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Correction Payment', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Paycheck Tips', amount: '0.00', jobUuid: primaryJobUuid },
      ])
    })

    it('filters out excluded types and sorts results', () => {
      const existingFixedCompensations = [
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
        { name: 'Reimbursement', amount: '50.00', jobUuid: primaryJobUuid },
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: "Owner's Draw", amount: '1000.00', jobUuid: primaryJobUuid },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations,
        primaryJobUuid,
        fixedCompensationTypes,
        excludedTypes: ['Reimbursement', "Owner's Draw", 'Minimum Wage Adjustment'],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Cash Tips', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '200.00', jobUuid: primaryJobUuid },
        { name: 'Correction Payment', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Paycheck Tips', amount: '0.00', jobUuid: primaryJobUuid },
      ])
    })

    it('handles empty existing compensations for non-owners', () => {
      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations: [],
        primaryJobUuid,
        fixedCompensationTypes,
        excludedTypes: ['Reimbursement', "Owner's Draw", 'Minimum Wage Adjustment'],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Cash Tips', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Correction Payment', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Paycheck Tips', amount: '0.00', jobUuid: primaryJobUuid },
      ])
    })

    it('filters out compensation types with undefined names', () => {
      const fixedCompensationTypesWithNulls: PayrollFixedCompensationTypesType[] = [
        { name: 'Bonus' },
        { name: 'Commission' },
        { name: undefined },
      ]

      const result = getAdditionalEarningsCompensations({
        flsaStatus: FlsaStatusType.Nonexempt,
        existingFixedCompensations: [],
        primaryJobUuid,
        fixedCompensationTypes: fixedCompensationTypesWithNulls,
        excludedTypes: [],
      })

      expect(result).toEqual([
        { name: 'Bonus', amount: '0.00', jobUuid: primaryJobUuid },
        { name: 'Commission', amount: '0.00', jobUuid: primaryJobUuid },
      ])
    })
  })

  describe('getReimbursementCompensation', () => {
    const primaryJobUuid = 'job-123'
    const fixedCompensationTypes: PayrollFixedCompensationTypesType[] = [
      { name: 'Bonus' },
      { name: 'Commission' },
      { name: 'Reimbursement' },
    ]

    it('returns existing reimbursement compensation when found', () => {
      const fixedCompensations = [
        { name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid },
        { name: 'Reimbursement', amount: '50.00', jobUuid: primaryJobUuid },
      ]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypes,
        primaryJobUuid,
      )

      expect(result).toEqual({
        name: 'Reimbursement',
        amount: '50.00',
        jobUuid: primaryJobUuid,
      })
    })

    it('returns case-insensitive match for existing reimbursement', () => {
      const fixedCompensations = [
        { name: 'REIMBURSEMENT', amount: '75.50', jobUuid: primaryJobUuid },
      ]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypes,
        primaryJobUuid,
      )

      expect(result).toEqual({
        name: 'REIMBURSEMENT',
        amount: '75.50',
        jobUuid: primaryJobUuid,
      })
    })

    it('creates new reimbursement when not found but available in types', () => {
      const fixedCompensations = [{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypes,
        primaryJobUuid,
      )

      expect(result).toEqual({
        name: 'Reimbursement',
        amount: '0.00',
        jobUuid: primaryJobUuid,
      })
    })

    it('returns null when reimbursement not found and not available in types', () => {
      const fixedCompensations = [{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }]

      const fixedCompensationTypesWithoutReimbursement = [{ name: 'Bonus' }, { name: 'Commission' }]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypesWithoutReimbursement,
        primaryJobUuid,
      )

      expect(result).toBeNull()
    })

    it('returns null when no primary job UUID provided', () => {
      const fixedCompensations = [{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypes,
        undefined,
      )

      expect(result).toBeNull()
    })

    it('handles case-insensitive matching for compensation types', () => {
      const fixedCompensations = [{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }]

      const fixedCompensationTypesWithDifferentCase = [{ name: 'Bonus' }, { name: 'REIMBURSEMENT' }]

      const result = getReimbursementCompensation(
        fixedCompensations,
        fixedCompensationTypesWithDifferentCase,
        primaryJobUuid,
      )

      expect(result).toEqual({
        name: 'Reimbursement',
        amount: '0.00',
        jobUuid: primaryJobUuid,
      })
    })

    it('handles empty fixed compensations array', () => {
      const result = getReimbursementCompensation([], fixedCompensationTypes, primaryJobUuid)

      expect(result).toEqual({
        name: 'Reimbursement',
        amount: '0.00',
        jobUuid: primaryJobUuid,
      })
    })

    it('handles empty fixed compensation types array', () => {
      const fixedCompensations = [{ name: 'Bonus', amount: '100.00', jobUuid: primaryJobUuid }]

      const result = getReimbursementCompensation(fixedCompensations, [], primaryJobUuid)

      expect(result).toBeNull()
    })
  })
})
