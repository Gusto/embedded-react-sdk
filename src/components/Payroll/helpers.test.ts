import { expect, describe, it } from 'vitest'
import {
  formatEmployeePayRate,
  getRegularHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
} from './helpers'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import { PaymentUnit } from '@gusto/embedded-api/models/components/compensation.js'
import type { TFunction } from 'i18next'

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
})
