import * as v from 'valibot'
import { type ChangeEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField, Grid, Flex } from '@/components/Common'
import { nameValidation } from '@/helpers/validations'
import { TitleSelect } from '@/components/Company/AssignSignatory/TitleSelect'

const emailMismatchError = 'email_mismatch'

export const InviteSignatorySchema = v.pipe(
  v.object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    confirmEmail: v.pipe(v.string(), v.nonEmpty(), v.email()),
    title: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.forward(
    v.check(({ email, confirmEmail }) => email === confirmEmail, emailMismatchError),
    ['confirmEmail'],
  ),
)

export type InviteSignatoryInputs = v.InferInput<typeof InviteSignatorySchema>

export const InviteSignatoryForm = () => {
  const { t } = useTranslation('Company.AssignSignatory')

  const {
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
    watch,
  } = useFormContext()

  // Some workarounds here to also ensure that modifying the email field
  // sets and clears the confirm_email field error state
  const confirmEmail = watch('confirmEmail')

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) {
      const value = event.target.value
      if (value === confirmEmail) {
        clearErrors('confirmEmail')
      }

      if (value !== confirmEmail) {
        setError('confirmEmail', { message: emailMismatchError })
      }
    }
  }

  return (
    <Flex flexDirection="column" gap={12}>
      <header>
        <h2>{t('inviteSignatory.title')}</h2>
        <p>{t('inviteSignatory.description')}</p>
      </header>

      <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
        <TextField
          control={control}
          name="email"
          label={t('inviteSignatory.signatoryEmail')}
          isRequired
          errorMessage={t('validations.email')}
          inputProps={{
            onChange: handleEmailChange,
          }}
        />
        <TextField
          control={control}
          name="confirmEmail"
          label={t('inviteSignatory.confirmEmail')}
          isRequired
          errorMessage={
            errors.confirmEmail?.message === emailMismatchError
              ? t('validations.emailMismatch')
              : t('validations.email')
          }
        />
        <TextField
          control={control}
          name="firstName"
          label={t('inviteSignatory.firstName')}
          isRequired
          errorMessage={t('validations.firstName')}
        />
        <TextField
          control={control}
          name="lastName"
          label={t('inviteSignatory.lastName')}
          isRequired
          errorMessage={t('validations.lastName')}
        />
        <TitleSelect />
      </Grid>
    </Flex>
  )
}
