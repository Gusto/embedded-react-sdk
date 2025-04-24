import * as v from 'valibot'
import { nameValidation, zipValidation, SSN_REGEX, phoneValidation } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'

const createSSNValidation = (hasSsn?: boolean) =>
  v.pipe(
    v.string(),
    v.custom(value => {
      // If they have an SSN on file and haven't modified the field (it's empty), it's valid
      if (hasSsn && !value) {
        return true
      }

      if (typeof value !== 'string') {
        return false
      }

      return SSN_REGEX.test(removeNonDigits(value))
    }),
  )

export const generateCreateSignatorySchema = (hasSsn?: boolean) =>
  v.object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    title: v.pipe(v.string(), v.nonEmpty()),
    phone: phoneValidation,
    ssn: createSSNValidation(hasSsn),
    birthday: v.instance(Date),
    street1: v.pipe(v.string(), v.nonEmpty()),
    street2: v.optional(v.string()),
    city: v.pipe(v.string(), v.nonEmpty()),
    state: v.pipe(v.string(), v.nonEmpty()),
    zip: zipValidation,
  })
