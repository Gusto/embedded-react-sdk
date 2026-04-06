import { z } from 'zod'

export const EditHistoricalPaymentFormSchema = z.object({
  wageType: z.enum(['Hourly', 'Fixed']),
  hours: z.number().nonnegative().max(20000).optional(),
  wage: z.number().nonnegative().optional(),
  bonus: z.number().nonnegative().optional(),
  reimbursement: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  contractorUuid: z.string(),
})

export const createEditHistoricalPaymentFormSchema = () => {
  return EditHistoricalPaymentFormSchema
}

export type EditHistoricalPaymentFormValues = z.infer<typeof EditHistoricalPaymentFormSchema>
