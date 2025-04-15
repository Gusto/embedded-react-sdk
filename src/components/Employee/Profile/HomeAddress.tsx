import { Link, ListBoxItem } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { useProfile } from './useProfile'
import { STATES_ABBR } from '@/shared/constants'
import { Alert, Checkbox, Grid, Select, TextField } from '@/components/Common'

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
  const { isSelfOnboardingIntended, isAdmin } = useProfile()

  const { control, watch } = useFormContext<HomeAddressInputs>()
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
        <TextField
          control={control}
          name="street1"
          label={t('street1')}
          isRequired
          errorMessage={t('validations.street1')}
        />
        <TextField control={control} name="street2" label={t('street2')} />
        <TextField
          control={control}
          name="city"
          isRequired
          label={t('city')}
          errorMessage={t('validations.city')}
        />
        <Select
          control={control}
          name="state"
          items={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
            name: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
            id: stateAbbr,
          }))}
          label={t('state')}
          placeholder={t('statePlaceholder')}
          errorMessage={t('validations.state')}
          isRequired
          validationBehavior="aria"
        >
          {(state: { name: string; id: string }) => <ListBoxItem>{state.name}</ListBoxItem>}
        </Select>
        <TextField
          control={control}
          name="zip"
          isRequired
          label={t('zip')}
          errorMessage={t('validations.zip')}
        />
      </Grid>
      <Checkbox
        control={control}
        name="courtesyWithholding"
        description={
          <>
            {t('courtesyWhithholdingDescription')}
            <Trans t={t} i18nKey="learnMoreCta" components={{ learnMore: <Link /> }} />
          </>
        }
      >
        {t('courtesyWithholdingLabel')}
      </Checkbox>
      {watchedCourtesyWithholding && (
        <Alert label={t('withholdingTitle')} variant="warning">
          <Trans t={t} i18nKey="withholdingNote" />
        </Alert>
      )}
    </>
  )
}
