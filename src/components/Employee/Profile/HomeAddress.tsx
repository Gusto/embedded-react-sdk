import { Alert, Checkbox, Grid, Select, TextField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'
import { Link, ListBoxItem } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'

export const HomeAddressSchema = v.object({
  street_1: v.pipe(v.string(), v.nonEmpty()),
  street_2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty()),
  state: v.pipe(v.string(), v.nonEmpty()),
  zip: v.pipe(
    v.string(),
    v.check(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
  ),
  courtesy_withholding: v.boolean(),
})

export type HomeAddressInputs = v.InferInput<typeof HomeAddressSchema>

export const HomeAddress = () => {
  const { t } = useTranslation('Employee.HomeAddress')

  const { control, watch } = useFormContext<HomeAddressInputs>()
  const watchedCourtesyWithholding = watch('courtesy_withholding')

  return (
    <>
      <div>
        <h2>{t('formTitle')}</h2>
        <p>{t('desc')}</p>
      </div>
      <Grid>
        <TextField
          control={control}
          name="street_1"
          label={t('street1')}
          isRequired
          errorMessage={t('validations.street1')}
        />
        <TextField control={control} name="street_2" label={t('street2')} />
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
        name="courtesy_withholding"
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
