import { useTranslation } from 'react-i18next'
import { useIndustryFormContext } from './Context'
import type { NaicsCode } from '@/models/NAICSCodes'

/** @internal */
export const Edit = () => {
  const { t } = useTranslation('Company.Industry')
  const { form } = useIndustryFormContext()

  return (
    <form.Fields.Industry
      label={t('label')}
      placeholder={t('placeholder')}
      validationMessages={{ REQUIRED: t('validations.required') }}
      // A classification saved against a code outside the bundled list carries
      // whatever title the API returned. When it returned none, fall back to the
      // code itself so the field still reads as classified rather than empty.
      getOptionLabel={({ code, title }: NaicsCode) => title || t('unmatchedIndustry', { code })}
    />
  )
}
