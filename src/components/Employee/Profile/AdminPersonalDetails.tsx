import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  AdminInputs,
  AdminInputsSchema,
  NameInputs,
  NameInputsSchema,
  SocialSecurityNumberInput,
  SocialSecurityNumberSchema,
  DateOfBirthInput,
  DateOfBirthSchema,
  type PersonalDetailsInputs,
} from './PersonalDetailsInputs'
import { useProfile } from './useProfile'
import { EmployeeOnboardingStatus } from '@/shared/constants'
import { CheckboxField } from '@/components/Common'

// Base schema with common fields
const PersonalDetailsBaseSchema = NameInputsSchema.merge(AdminInputsSchema)

// Use Zod's discriminated union with proper composition
export const AdminPersonalDetailsSchema = z.discriminatedUnion('selfOnboarding', [
  // Case 1: Self onboarding is true - only base fields required
  PersonalDetailsBaseSchema.extend({
    selfOnboarding: z.literal(true),
    enableSsn: z.boolean().optional(),
  }),
  // Case 2: Self onboarding is false - additional fields required
  PersonalDetailsBaseSchema.merge(SocialSecurityNumberSchema)
    .merge(DateOfBirthSchema)
    .extend({
      selfOnboarding: z.literal(false),
    }),
])

export const AdminPersonalDetails = () => {
  const { companyLocations, employee, isAdmin, isSelfOnboardingEnabled } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  const { watch, setValue, getFieldState } = useFormContext<PersonalDetailsInputs>()

  const isSelfOnboardingChecked = watch('selfOnboarding')
  const { isDirty: isSsnDirty } = getFieldState('ssn')

  useEffect(() => {
    if (isSelfOnboardingChecked) {
      setValue('enableSsn', false)
    } else {
      setValue('enableSsn', isSsnDirty ? true : !employee?.hasSsn)
    }
  }, [isSelfOnboardingChecked, employee?.hasSsn, isSsnDirty, setValue])

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <NameInputs />
      <AdminInputs companyLocations={companyLocations} />
      {isSelfOnboardingEnabled && (
        <CheckboxField
          name="selfOnboarding"
          label={t('selfOnboardingLabel')}
          isDisabled={
            employee?.onboarded ||
            employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
            employee?.onboardingStatus ===
              EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW
          }
        />
      )}

      {!isSelfOnboardingChecked && (
        <>
          <SocialSecurityNumberInput employee={employee} />
          <DateOfBirthInput />
        </>
      )}
    </>
  )
}
