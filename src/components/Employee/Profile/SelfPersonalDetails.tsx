import * as v from 'valibot'
import {
  NameInputsSchema,
  SocialSecurityNumberSchema,
  DateOfBirthSchema,
  NameInputs,
  SocialSecurityNumberInput,
  DateOfBirthInput,
} from './PersonalDetailsInputs'
import { useProfile } from '@/components/Employee/Profile/Profile'

export const SelfPersonalDetailsSchema = v.variant('enableSsn', [
  v.object({
    ...NameInputsSchema.entries,
    ...SocialSecurityNumberSchema.entries,
    ...DateOfBirthSchema.entries,
    enableSsn: v.literal(true),
  }),
  v.object({
    ...NameInputsSchema.entries,
    ...DateOfBirthSchema.entries,
    enableSsn: v.literal(false),
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
