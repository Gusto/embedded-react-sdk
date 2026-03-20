import type { PayScheduleCreateUpdate } from '@gusto/embedded-api/models/components/payschedulecreateupdate'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { PayScheduleObject as PayScheduleType } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayPeriods } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview'
import { z } from 'zod'
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

export const PayScheduleSchema = z.object({
  frequency: z.enum(['Every week', 'Every other week', 'Twice per month', 'Monthly']),
  anchorPayDate: z.date().optional(),
  anchorEndOfPayPeriod: z.date().optional(),
  day1: z.number().min(1).max(31).optional(),
  day2: z.number().min(1).max(31).optional(),
  customName: z.string().optional(),
  customTwicePerMonth: z.string().optional(),
})

export type PayScheduleInputs = z.input<typeof PayScheduleSchema>
export type PayScheduleOutputs = z.output<typeof PayScheduleSchema>

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
