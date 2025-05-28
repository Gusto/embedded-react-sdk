import { z } from 'zod'
import {
  NameInputsSchema,
  SocialSecurityNumberSchema,
  DateOfBirthSchema,
  NameInputs,
  SocialSecurityNumberInput,
  DateOfBirthInput,
} from './PersonalDetailsInputs'
import { useProfile } from './useProfile'

export const SelfPersonalDetailsSchema = z.discriminatedUnion('enableSsn', [
  // Case 1: enableSsn is true
  NameInputsSchema.merge(SocialSecurityNumberSchema)
    .merge(DateOfBirthSchema)
    .extend({
      enableSsn: z.literal(true),
    }),
  // Case 2: enableSsn is false
  NameInputsSchema.merge(DateOfBirthSchema).extend({
    enableSsn: z.literal(false),
  }),
])

export const SelfPersonalDetails = () => {
  const { employee, isAdmin } = useProfile()

  if (isAdmin) {
    return null
  }

  return (
    <>
      <NameInputs />
      <SocialSecurityNumberInput employee={employee} />
      <DateOfBirthInput />
    </>
  )
}
