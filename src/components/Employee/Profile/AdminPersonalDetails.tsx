import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
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
import { Checkbox } from '@/components/Common'

const PersonalDetailsCommonSchema = v.object({
  ...NameInputsSchema.entries,
  ...AdminInputsSchema.entries,
})

export const AdminPersonalDetailsSchema = v.variant('selfOnboarding', [
  v.object({
    ...PersonalDetailsCommonSchema.entries,
    selfOnboarding: v.literal(true),
  }),
  v.variant('enableSsn', [
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      ...SocialSecurityNumberSchema.entries,
      ...DateOfBirthSchema.entries,
      selfOnboarding: v.literal(false),
      enableSsn: v.literal(true),
    }),
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      ...DateOfBirthSchema.entries,
      selfOnboarding: v.literal(false),
      enableSsn: v.literal(false),
    }),
  ]),
])

export const AdminPersonalDetails = () => {
  const { companyLocations, employee, isAdmin, isSelfOnboardingEnabled } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  const { control, watch, setValue, getFieldState } = useFormContext<PersonalDetailsInputs>()

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
        <Checkbox
          control={control}
          name="selfOnboarding"
          isDisabled={
            employee?.onboarded ||
            employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
            employee?.onboardingStatus ===
              EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW
          }
        >
          {t('selfOnboardingLabel')}
        </Checkbox>
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
