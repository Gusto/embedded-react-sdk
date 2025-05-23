import { z } from 'zod'
import { nameValidation, zipValidation, SSN_REGEX, phoneValidation } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'

const createSSNValidation = (hasSsn?: boolean) =>
  z.string().refine(value => {
    // If they have an SSN on file and haven't modified the field (it's empty), it's valid
    if (hasSsn && !value) {
      return true
    }

    if (typeof value !== 'string') {
      return false
    }

    return SSN_REGEX.test(removeNonDigits(value))
  })

export const generateCreateSignatorySchema = (hasSsn?: boolean) =>
  z.object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: z.string().min(1).email(),
    title: z.string().min(1),
    phone: phoneValidation,
    ssn: createSSNValidation(hasSsn),
    birthday: z.date(),
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: zipValidation,
  })
