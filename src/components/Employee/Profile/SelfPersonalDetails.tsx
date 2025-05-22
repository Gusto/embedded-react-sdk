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

export const SelfPersonalDetailsSchema = z.union([
  // Case 1: enableSsn is true
  z.object({
    ...NameInputsSchema.shape,
    ...SocialSecurityNumberSchema.shape,
    ...DateOfBirthSchema.shape,
    enableSsn: z.literal(true),
  }),
  // Case 2: enableSsn is false
  z.object({
    ...NameInputsSchema.shape,
    ...DateOfBirthSchema.shape,
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
