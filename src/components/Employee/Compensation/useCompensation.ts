import type { Job } from '@gusto/embedded-api/models/components/job'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { z } from 'zod'
import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const CompensationSchema = z
  .object({
    jobTitle: z.string().min(1),
    // adjustForMinimumWage can be true or false
    adjustForMinimumWage: z.boolean(),
    // If adjustForMinimumWage is true, minimumWageId is required
    minimumWageId: z.string().optional(),
    // stateWcCovered can be true, false, or undefined
    stateWcCovered: z.boolean().optional(),
    // If stateWcCovered is true, stateWcClassCode is required
    stateWcClassCode: z.string().optional(),
    // twoPercentShareholder can be true, false, or undefined
    twoPercentShareholder: z.boolean().optional(),
    // FLSA status with different payment options
    flsaStatus: z.enum([
      FlsaStatus.EXEMPT,
      FlsaStatus.SALARIED_NONEXEMPT,
      FlsaStatus.NONEXEMPT,
      FlsaStatus.OWNER,
      FlsaStatus.COMMISSION_ONLY_EXEMPT,
      FlsaStatus.COMISSION_ONLY_NONEXEMPT,
    ]),
    paymentUnit: z.enum(['Hour', 'Week', 'Month', 'Year', 'Paycheck']),
    rate: z.number().min(1).transform(String),
  })
  .refine(
    data => {
      // For Owner, paymentUnit must be Paycheck
      if (data.flsaStatus === FlsaStatus.OWNER && data.paymentUnit !== 'Paycheck') {
        return false
      }
      // For Commission only, paymentUnit must be Year and rate must be 0
      if (
        (data.flsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT ||
          data.flsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT) &&
        (data.paymentUnit !== 'Year' || Number(data.rate) !== 0)
      ) {
        return false
      }
      // For Exempt status, validate salary threshold
      if (
        data.flsaStatus === FlsaStatus.EXEMPT &&
        yearlyRate(Number(data.rate), data.paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
      ) {
        return false
      }

      return true
    },
    {
      message: 'Invalid compensation configuration',
      path: ['flsaStatus'],
    },
  )
  .refine(
    data => {
      if (data.adjustForMinimumWage) {
        return data.minimumWageId !== undefined && data.minimumWageId !== ''
      }
      return true
    },
    {
      message: 'Minimum wage ID is required when adjustForMinimumWage is true',
      path: ['minimumWageId'],
    },
  )
  .refine(
    data => {
      if (data.stateWcCovered === true) {
        return data.stateWcClassCode !== undefined && data.stateWcClassCode !== ''
      }
      return true
    },
    {
      message: 'State WC class code is required when stateWcCovered is true',
      path: ['stateWcClassCode'],
    },
  )

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
