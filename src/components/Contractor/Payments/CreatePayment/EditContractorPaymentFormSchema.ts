import { z } from 'zod'

const SUPPORTED_PAYMENT_METHODS = ['Check', 'Direct Deposit'] as const

export const EditContractorPaymentFormSchema = z.object({
  wageType: z.enum(['Hourly', 'Fixed']),
  hours: z.number().nonnegative().max(20000).optional(),
  wage: z.number().nonnegative().optional(),
  bonus: z.number().nonnegative().optional(),
  reimbursement: z.number().nonnegative().optional(),
  paymentMethod: z.enum(SUPPORTED_PAYMENT_METHODS),
  hourlyRate: z.number().nonnegative().optional(),
  contractorUuid: z.string(),
  contractorPaymentMethod: z.string().optional(),
})

export const createEditContractorPaymentFormSchema = () => {
  return EditContractorPaymentFormSchema.refine(
    data => {
      if (data.contractorPaymentMethod === 'Check' && data.paymentMethod === 'Direct Deposit') {
        return false
      }
      return true
    },
    {
      message: 'VALIDATION_ERROR',
      path: ['paymentMethod'],
    },
  )
}

export type EditContractorPaymentFormValues = z.infer<typeof EditContractorPaymentFormSchema>
