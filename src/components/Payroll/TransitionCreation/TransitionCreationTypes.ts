import { z } from 'zod'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

export interface TransitionCreationProps extends BaseComponentInterface<'Payroll.TransitionCreation'> {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
}

export interface TransitionCreationFormData {
  checkDate: Date | null
  skipRegularDeductions: boolean
}

export function createTransitionCreationSchema(
  t: (key: string, options?: Record<string, unknown>) => string,
  minCheckDate: Date,
  achLeadTimeBusinessDays?: number,
) {
  return z.object({
    checkDate: z
      .date()
      .nullable()
      .refine((val): val is Date => val !== null, {
        message: t('errors.checkDateRequired'),
      })
      .refine(
        val => {
          const normalized = new Date(val)
          normalized.setHours(0, 0, 0, 0)
          const min = new Date(minCheckDate)
          min.setHours(0, 0, 0, 0)
          return normalized >= min
        },
        { message: t('errors.checkDateAchLeadTime', { count: achLeadTimeBusinessDays ?? 2 }) },
      ),
    skipRegularDeductions: z.boolean(),
  })
}

export interface TransitionCreationPresentationProps {
  startDate: string
  endDate: string
  payScheduleName: string | null
  isPending?: boolean
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  isTaxWithholdingModalOpen: boolean
  onTaxWithholdingEditClick: () => void
  onTaxWithholdingModalDone: (config: OffCycleTaxWithholdingConfig) => void
  onTaxWithholdingModalCancel: () => void
}
