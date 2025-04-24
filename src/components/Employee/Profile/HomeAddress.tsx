import { Link } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { useProfile } from './useProfile'
import { STATES_ABBR } from '@/shared/constants'
import { CheckboxField, Grid, SelectField, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const HomeAddressSchema = v.variant('selfOnboarding', [
  v.object({
    street1: v.pipe(v.string(), v.nonEmpty()),
    street2: v.optional(v.string()),
    city: v.pipe(v.string(), v.nonEmpty()),
    state: v.pipe(v.string(), v.nonEmpty()),
    zip: v.pipe(
      v.string(),
      v.check(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
    ),
    courtesyWithholding: v.boolean(),
    selfOnboarding: v.union([v.literal(false), v.undefined()]),
  }),
  v.object({ selfOnboarding: v.literal(true) }),
])

export type HomeAddressInputs = v.InferInput<typeof HomeAddressSchema>

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
        <h2>{t('formTitle')}</h2>
        <p>{t('desc')}</p>
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
            <Trans t={t} i18nKey="learnMoreCta" components={{ learnMore: <Link /> }} />
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
