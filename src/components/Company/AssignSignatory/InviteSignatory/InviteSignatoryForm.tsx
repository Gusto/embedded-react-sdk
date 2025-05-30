import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextInputField, Grid, Flex } from '@/components/Common'
import { nameValidation } from '@/helpers/validations'
import { TitleSelect } from '@/components/Company/AssignSignatory/TitleSelect'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const emailMismatchError = 'email_mismatch'

export const InviteSignatorySchema = z
  .object({
    firstName: nameValidation,
    lastName: nameValidation,
    email: z.string().min(1).email(),
    confirmEmail: z.string().min(1).email(),
    title: z.string().min(1),
  })
  .refine(data => data.email === data.confirmEmail, {
    message: emailMismatchError,
    path: ['confirmEmail'],
  })

export type InviteSignatoryInputs = z.infer<typeof InviteSignatorySchema>

export const InviteSignatoryForm = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const Components = useComponentContext()

  const {
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
    watch,
  } = useFormContext()

  // Some workarounds here to also ensure that modifying the email field
  // sets and clears the confirm_email field error state
  const confirmEmail = watch('confirmEmail')

  const handleEmailChange = (value: string) => {
    if (isSubmitted) {
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
        <Components.Heading as="h2">{t('inviteSignatory.title')}</Components.Heading>
        <Components.Text>{t('inviteSignatory.description')}</Components.Text>
      </header>

      <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
        <TextInputField
          name="email"
          label={t('inviteSignatory.signatoryEmail')}
          isRequired
          errorMessage={t('validations.email')}
          onChange={handleEmailChange}
        />
        <TextInputField
          name="confirmEmail"
          label={t('inviteSignatory.confirmEmail')}
          isRequired
          errorMessage={
            errors.confirmEmail?.message === emailMismatchError
              ? t('validations.emailMismatch')
              : t('validations.email')
          }
        />
        <TextInputField
          name="firstName"
          label={t('inviteSignatory.firstName')}
          isRequired
          errorMessage={t('validations.firstName')}
        />
        <TextInputField
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
