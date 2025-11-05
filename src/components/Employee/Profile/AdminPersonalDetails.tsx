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
import styles from './AdminPersonalDetails.module.scss'
import { useProfile } from './useProfile'
import { SwitchField } from '@/components/Common'

export const AdminSelfOnboardingPersonalDetailsSchema = AdminInputsSchema.merge(
  NameInputsSchema,
).extend({
  selfOnboarding: z.boolean(),
})

export const AdminPersonalDetailsSchema = z.discriminatedUnion('enableSsn', [
  AdminSelfOnboardingPersonalDetailsSchema.merge(SocialSecurityNumberSchema)
    .merge(DateOfBirthSchema)
    .extend({
      enableSsn: z.literal(true),
    }),
  AdminSelfOnboardingPersonalDetailsSchema.merge(DateOfBirthSchema).extend({
    enableSsn: z.literal(false),
  }),
])

export const AdminPersonalDetails = () => {
  const {
    companyLocations,
    employee,
    isAdmin,
    isSelfOnboardingEnabled,
    hasCompletedSelfOnboarding,
  } = useProfile()
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
      {isSelfOnboardingEnabled && !hasCompletedSelfOnboarding && (
        <div className={styles.switchFieldContainer}>
          <SwitchField
            name="selfOnboarding"
            description={t('selfOnboardingDescription')}
            label={t('selfOnboardingLabel')}
          />
        </div>
      )}

      <NameInputs />
      <AdminInputs companyLocations={companyLocations} />

      {(!isSelfOnboardingChecked || hasCompletedSelfOnboarding) && (
        <>
          <SocialSecurityNumberInput employee={employee} />
          <DateOfBirthInput />
        </>
      )}
    </>
  )
}
