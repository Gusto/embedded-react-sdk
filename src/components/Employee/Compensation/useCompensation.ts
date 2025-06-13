import type { Job } from '@gusto/embedded-api/models/components/job'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { z } from 'zod'
import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const rateMinimumError = 'rate_minimum_error'
export const rateExemptThresholdError = 'rate_exempt_threshold_error'

export const CompensationSchema = z
  .object({
    jobTitle: z.string().min(1),
    adjustForMinimumWage: z.boolean(),
    minimumWageId: z.string().optional(),
    stateWcCovered: z.boolean().optional(),
    stateWcClassCode: z.string().optional(),
    twoPercentShareholder: z.boolean().optional(),
    flsaStatus: z.enum([
      FlsaStatus.EXEMPT,
      FlsaStatus.SALARIED_NONEXEMPT,
      FlsaStatus.NONEXEMPT,
      FlsaStatus.OWNER,
      FlsaStatus.COMMISSION_ONLY_EXEMPT,
      FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
    ]),
    paymentUnit: z.enum(['Hour', 'Week', 'Month', 'Year', 'Paycheck']),
    rate: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    // adjustForMinimumWage
    if (data.adjustForMinimumWage && (!data.minimumWageId || data.minimumWageId.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minimumWageId'],
        message: 'minimumWageId is required when adjustForMinimumWage is true',
      })
    }

    // stateWcCovered
    if (
      data.stateWcCovered === true &&
      (!data.stateWcClassCode || data.stateWcClassCode.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stateWcClassCode'],
        message: 'stateWcClassCode is required when stateWcCovered is true',
      })
    }

    // FLSA logic
    const { flsaStatus, paymentUnit, rate } = data
    if (
      flsaStatus === FlsaStatus.EXEMPT ||
      flsaStatus === FlsaStatus.SALARIED_NONEXEMPT ||
      flsaStatus === FlsaStatus.NONEXEMPT
    ) {
      // For EXEMPT, check salary threshold
      if (
        flsaStatus === FlsaStatus.EXEMPT &&
        rate !== undefined &&
        yearlyRate(Number(rate), paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateExemptThresholdError,
        })
      }

      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    } else if (flsaStatus === FlsaStatus.OWNER) {
      if (paymentUnit !== 'Paycheck') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: 'paymentUnit must be Paycheck for OWNER',
        })
      }
      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    } else if (
      [FlsaStatus.COMMISSION_ONLY_EXEMPT, FlsaStatus.COMMISSION_ONLY_NONEXEMPT].includes(flsaStatus)
    ) {
      if (paymentUnit !== 'Year') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: 'paymentUnit must be Year for commission-only FLSA statuses',
        })
      }
      if (rate !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    }
  })

export type CompensationInputs = z.input<typeof CompensationSchema>
export type CompensationOutputs = z.output<typeof CompensationSchema>

export type MODE =
  | 'LIST'
  | 'ADD_ADDITIONAL_JOB'
  | 'ADD_INITIAL_JOB'
  | 'EDIT_ADDITIONAL_JOB'
  | 'EDIT_INITIAL_JOB'
  | 'PROCEED'

type CompensationContextType = {
  employeeJobs: Job[]
  currentJob?: Job | null
  primaryFlsaStatus?: string
  isPending: boolean
  mode: MODE
  showFlsaChangeWarning: boolean
  minimumWages: MinimumWage[]
  state?: string
  showTwoPercentStakeholder?: boolean
  submitWithEffect: (newMode: MODE) => void
  handleAdd: () => void
  handleEdit: (uuid: string) => void
  handleDelete: (uuid: string) => void
  handleFlsaChange: (status: string | number) => void
  handleCancelAddJob: () => void
}
const [useCompensation, CompensationProvider] =
  createCompoundContext<CompensationContextType>('CompensationContext')
export { useCompensation, CompensationProvider }
