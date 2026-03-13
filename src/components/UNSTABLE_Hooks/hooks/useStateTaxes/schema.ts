import { z } from 'zod'

export const stateTaxesSchema = z.object({
  states: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})

export type StateTaxesFormData = z.infer<typeof stateTaxesSchema>
export type StateTaxesFormPayload = z.output<typeof stateTaxesSchema>
