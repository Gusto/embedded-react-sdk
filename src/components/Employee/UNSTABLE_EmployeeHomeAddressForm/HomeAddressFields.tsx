import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { useHomeAddressBase } from './useHomeAddressBase'
import { TextInputField, Grid, SelectField, CheckboxField } from '@/components/Common'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.HomeAddressFields' as const

export type HomeAddressFieldsMetadata = ReturnType<typeof useHomeAddressBase>['fields']

interface HomeAddressFieldsProps {
  fields: HomeAddressFieldsMetadata
}

export function HomeAddressFields({ fields }: HomeAddressFieldsProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const { t: tCommon } = useTranslation('common')
  const {
    formState: { errors },
  } = useFormContext()

  const validationMessages: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_ZIP_FORMAT: t('validations.INVALID_ZIP_FORMAT'),
  }
  const v = (message: unknown) =>
    typeof message === 'string' ? validationMessages[message] : undefined

  return (
    <>
      <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
        <TextInputField
          name={fields.street1.name}
          label={t('street1')}
          isRequired={fields.street1.isRequired}
          errorMessage={v(errors.street1?.message)}
        />
        <TextInputField name={fields.street2.name} label={t('street2')} />
        <TextInputField
          name={fields.city.name}
          label={t('city')}
          isRequired={fields.city.isRequired}
          errorMessage={v(errors.city?.message)}
        />
        <SelectField
          name={fields.state.name}
          label={t('state')}
          placeholder={t('statePlaceholder')}
          isRequired={fields.state.isRequired}
          options={fields.state.options.map(value => ({
            value,
            label: tCommon(`statesHash.${value}`),
          }))}
          errorMessage={v(errors.state?.message)}
        />
        <TextInputField
          name={fields.zip.name}
          label={t('zip')}
          isRequired={fields.zip.isRequired}
          errorMessage={v(errors.zip?.message)}
        />
      </Grid>
      <CheckboxField
        name={fields.courtesyWithholding.name}
        label={t('courtesyWithholdingLabel')}
        description={t('courtesyWithholdingDescription')}
      />
    </>
  )
}
