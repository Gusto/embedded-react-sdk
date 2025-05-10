import type { PayScheduleCreateUpdate } from '@gusto/embedded-api/models/components/payschedulecreateupdate'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { PayScheduleObject as PayScheduleType } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayPeriods } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview'
import * as v from 'valibot'
import type { RequireAtLeastOne } from '@/types/Helpers'
import { createCompoundContext } from '@/components/Base'

export type MODE =
  | 'LIST_PAY_SCHEDULES'
  | 'ADD_PAY_SCHEDULE'
  | 'EDIT_PAY_SCHEDULE'
  | 'PREVIEW_PAY_SCHEDULE'

type PayScheduleContextType = {
  companyId: string
  handleAdd: () => void
  handleEdit: (schedule: PayScheduleType) => void
  handleCancel: () => void
  handleContinue: () => void
  mode: MODE
  paySchedules: PayScheduleList[] | undefined | null
  currentPaySchedule: PayScheduleType | undefined | null
  payPeriodPreview?: PayPeriods[]
  payPreviewLoading?: boolean
}

export const PayScheduleSchema = v.object({
  frequency: v.union([
    v.literal('Every week'),
    v.literal('Every other week'),
    v.literal('Twice per month'),
    v.literal('Monthly'),
  ]),
  anchorPayDate: v.optional(v.instance(Date)),
  anchorEndOfPayPeriod: v.optional(v.instance(Date)),
  day1: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  day2: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(31))),
  customName: v.optional(v.string()),
  customTwicePerMonth: v.optional(v.string()),
  payPeriodPreviewRange: v.optional(v.number()),
})

export type PayScheduleInputs = v.InferInput<typeof PayScheduleSchema>
export type PayScheduleOutputs = v.InferOutput<typeof PayScheduleSchema>

export type PayScheduleDefaultValues = RequireAtLeastOne<
  Partial<
    Pick<
      PayScheduleCreateUpdate,
      'anchorPayDate' | 'anchorEndOfPayPeriod' | 'day1' | 'day2' | 'customName' | 'frequency'
    >
  >
>

const [usePaySchedule, PayScheduleProvider] =
  createCompoundContext<PayScheduleContextType>('PayScheduleContext')
export { usePaySchedule, PayScheduleProvider }
