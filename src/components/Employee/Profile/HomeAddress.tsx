import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useProfile } from './useProfile'
import { STATES_ABBR } from '@/shared/constants'
import { CheckboxField, Grid, SelectField, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const HomeAddressSchema = z.union([
  // Case 1: selfOnboarding is false or undefined
  z.object({
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().refine(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
    courtesyWithholding: z.boolean(),
    selfOnboarding: z.union([z.literal(false), z.undefined()]),
  }),
  // Case 2: selfOnboarding is true
  z.object({
    selfOnboarding: z.literal(true),
  }),
])

export type HomeAddressInputs = z.infer<typeof HomeAddressSchema>

export const HomeAddress = () => {
  const { t } = useTranslation('Employee.HomeAddress')
  const Components = useComponentContext()
  const { isSelfOnboardingIntended, isAdmin } = useProfile()

  const { watch } = useFormContext<HomeAddressInputs>()
  const watchedCourtesyWithholding = watch('courtesyWithholding')

  if (isAdmin && isSelfOnboardingIntended) {
    return null
  }

  return (
    <>
      <div>
        <Components.Heading as="h2">{t('formTitle')}</Components.Heading>
        <Components.Text>{t('desc')}</Components.Text>
      </div>
      <Grid
        gridTemplateColumns={{
          base: '1fr',
          small: ['1fr', '1fr'],
        }}
        gap={20}
      >
        <TextInputField
          name="street1"
          label={t('street1')}
          isRequired
          errorMessage={t('validations.street1')}
        />
        <TextInputField name="street2" label={t('street2')} />
        <TextInputField
          name="city"
          isRequired
          label={t('city')}
          errorMessage={t('validations.city')}
        />
        <SelectField
          name="state"
          options={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
            label: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
            value: stateAbbr,
          }))}
          label={t('state')}
          placeholder={t('statePlaceholder')}
          errorMessage={t('validations.state')}
          isRequired
        />
        <TextInputField
          name="zip"
          isRequired
          label={t('zip')}
          errorMessage={t('validations.zip')}
        />
      </Grid>
      <CheckboxField
        name="courtesyWithholding"
        label={t('courtesyWithholdingLabel')}
        description={
          <>
            {t('courtesyWhithholdingDescription')}
            <Trans t={t} i18nKey="learnMoreCta" components={{ learnMore: <Components.Link /> }} />
          </>
        }
      />
      {watchedCourtesyWithholding && (
        <Components.Alert label={t('withholdingTitle')} status="warning">
          <Trans t={t} i18nKey="withholdingNote" />
        </Components.Alert>
      )}
    </>
  )
}
