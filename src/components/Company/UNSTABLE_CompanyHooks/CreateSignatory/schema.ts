import { z } from 'zod'
import {
  zipValidation,
  SSN_REGEX,
  phoneValidation,
  NAME_REGEX,
  withValidation,
} from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { ValidationCode } from '@/hooks/UNSTABLE/types'

export const SignatoryValidation = {
  NameInvalidCharacters: 'name_invalid_characters',
} as const

const requiredString = z
  .string()
  .superRefine(withValidation(ValidationCode.Required, (val: string) => val.length > 0))

const nameField = requiredString.superRefine(
  withValidation(SignatoryValidation.NameInvalidCharacters, (val: string) => NAME_REGEX.test(val)),
)

const createSSNValidation = (hasSsn?: boolean) =>
  z.string().superRefine((value, ctx) => {
    if (hasSsn && !value) return
    if (typeof value !== 'string' || !SSN_REGEX.test(removeNonDigits(value))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { validation: ValidationCode.SsnInvalidFormat },
      })
    }
  })

export const generateCreateSignatorySchema = (hasSsn?: boolean) =>
  z.object({
    firstName: nameField,
    lastName: nameField,
    email: requiredString.superRefine(
      withValidation(ValidationCode.EmailInvalidFormat, (val: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      ),
    ),
    title: requiredString,
    phone: phoneValidation,
    ssn: createSSNValidation(hasSsn),
    birthday: z.date(),
    street1: requiredString,
    street2: z.string().optional(),
    city: requiredString,
    state: requiredString,
    zip: zipValidation,
  })

export type CreateSignatoryFormData = z.infer<ReturnType<typeof generateCreateSignatorySchema>>
