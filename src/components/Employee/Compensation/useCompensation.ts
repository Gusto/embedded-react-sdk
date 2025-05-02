import type { Job } from '@gusto/embedded-api/models/components/job'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import * as v from 'valibot'
import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const CompensationSchema = v.intersect([
  v.object({
    jobTitle: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.variant('adjustForMinimumWage', [
    v.object({
      adjustForMinimumWage: v.literal(true),
      minimumWageId: v.pipe(v.string(), v.nonEmpty()),
    }),
    v.object({ adjustForMinimumWage: v.literal(false) }),
  ]),
  v.variant('stateWcCovered', [
    v.object({
      stateWcCovered: v.literal(true),
      stateWcClassCode: v.pipe(v.string(), v.nonEmpty()),
    }),
    v.object({ stateWcCovered: v.literal(false) }),
    v.object({ stateWcCovered: v.undefined() }),
  ]),
  v.variant('twoPercentShareholder', [
    v.object({ twoPercentShareholder: v.boolean() }),
    v.object({ twoPercentShareholder: v.undefined() }),
  ]),
  v.variant('flsaStatus', [
    v.pipe(
      v.object({
        flsaStatus: v.union([
          v.literal(FlsaStatus.EXEMPT),
          v.literal(FlsaStatus.SALARIED_NONEXEMPT),
          v.literal(FlsaStatus.NONEXEMPT),
        ]),
        paymentUnit: v.union([
          v.literal('Hour'),
          v.literal('Week'),
          v.literal('Month'),
          v.literal('Year'),
        ]),
        rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
      }),
      //Exempt salary threshold validation:
      v.forward(
        v.check(input => {
          return (
            //TODO: this should not be validated for non-primary jobs for NONEXEMPT
            input.flsaStatus !== FlsaStatus.EXEMPT ||
            yearlyRate(Number(input.rate), input.paymentUnit) >= FLSA_OVERTIME_SALARY_LIMIT
          )
        }),
        ['flsaStatus'],
      ),
    ),
    v.object({
      flsaStatus: v.literal(FlsaStatus.OWNER),
      paymentUnit: v.literal('Paycheck'),
      rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
    }),
    v.object({
      flsaStatus: v.union([
        v.literal(FlsaStatus.COMMISSION_ONLY_EXEMPT),
        v.literal(FlsaStatus.COMISSION_ONLY_NONEXEMPT),
      ]),
      paymentUnit: v.literal('Year'),
      rate: v.pipe(v.literal(0), v.transform(String)),
    }),
  ]),
])
export type CompensationInputs = v.InferInput<typeof CompensationSchema>
export type CompensationOutputs = v.InferOutput<typeof CompensationSchema>

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
