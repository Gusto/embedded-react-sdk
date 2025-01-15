import { useEffect } from 'react'
import { Checkbox } from '@/components/Common'
import { useProfile } from '@/components/Employee/Profile/Profile'
import { EmployeeOnboardingStatus } from '@/shared/constants'
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

const PersonalDetailsCommonSchema = v.object({
  ...NameInputsSchema.entries,
  ...AdminInputsSchema.entries,
})

export const AdminPersonalDetailsSchema = v.variant('self_onboarding', [
  v.object({
    ...PersonalDetailsCommonSchema.entries,
    self_onboarding: v.literal(true),
  }),
  v.variant('enableSsn', [
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      ...SocialSecurityNumberSchema.entries,
      ...DateOfBirthSchema.entries,
      self_onboarding: v.literal(false),
      enableSsn: v.literal(true),
    }),
    v.object({
      ...PersonalDetailsCommonSchema.entries,
      ...DateOfBirthSchema.entries,
      self_onboarding: v.literal(false),
      enableSsn: v.literal(false),
    }),
  ]),
])

export const AdminPersonalDetails = () => {
  const { companyLocations, employee, isAdmin } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  const { control, watch, setValue, getFieldState } = useFormContext<PersonalDetailsInputs>()

  const isSelfOnboardingChecked = watch('self_onboarding')
  const { isDirty: isSsnDirty } = getFieldState('ssn')

  useEffect(() => {
    if (isSelfOnboardingChecked) {
      setValue('enableSsn', false)
    } else {
      setValue('enableSsn', isSsnDirty ? true : !employee?.has_ssn)
    }
  }, [isSelfOnboardingChecked, employee?.has_ssn, isSsnDirty, setValue])

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <NameInputs />
      <AdminInputs companyLocations={companyLocations} />
      <Checkbox
        control={control}
        name="self_onboarding"
        isDisabled={
          employee?.onboarded ||
          employee?.onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
          employee?.onboarding_status ===
            EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW
        }
      >
        {t('selfOnboardingLabel')}
      </Checkbox>

      {!isSelfOnboardingChecked && (
        <>
          <SocialSecurityNumberInput employee={employee} />
          <DateOfBirthInput />
        </>
      )}
    </>
  )
}
