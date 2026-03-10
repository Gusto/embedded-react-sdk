import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { useWorkAddressBase } from './useWorkAddressBase'
import { SelectField, DatePickerField, Grid } from '@/components/Common'
import { addressInline } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.WorkAddressFields' as const

export type WorkAddressFieldsMetadata = ReturnType<typeof useWorkAddressBase>['fields']

interface WorkAddressFieldsProps {
  fields: WorkAddressFieldsMetadata
  companyLocations: Location[]
}

export function WorkAddressFields({ fields, companyLocations }: WorkAddressFieldsProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const {
    formState: { errors },
  } = useFormContext()

  const validationMessages: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_DATE_FORMAT: t('validations.INVALID_DATE_FORMAT'),
  }
  const v = (message: unknown) =>
    typeof message === 'string' ? validationMessages[message] : undefined

  return (
    <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
      <SelectField
        name={fields.locationUuid.name}
        label={t('workAddress')}
        description={t('workAddressDescription')}
        placeholder={t('workAddressPlaceholder')}
        isRequired={fields.locationUuid.isRequired}
        options={companyLocations.map(location => ({
          value: location.uuid,
          label: addressInline(location),
        }))}
        errorMessage={v(errors.locationUuid?.message)}
      />
      <DatePickerField
        name={fields.effectiveDate.name}
        label={t('startDate')}
        description={t('startDateDescription')}
        isRequired={fields.effectiveDate.isRequired}
        errorMessage={v(errors.effectiveDate?.message)}
      />
    </Grid>
  )
}
