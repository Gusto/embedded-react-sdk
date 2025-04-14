import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-aria-components'
import {
  TaxPayerType,
  FilingForm,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import type { FederalTaxFormInputs } from './FederalTaxes'
import { useFederalTaxes } from './FederalTaxes'
import { TextField, SelectField, Flex } from '@/components/Common'
import { usePlaceholderEin, normalizeEin } from '@/helpers/federalEin'

export function Form() {
  const { t } = useTranslation('Company.FederalTaxes')
  const { federalTaxDetails } = useFederalTaxes()
  const { control, setValue } = useFormContext<FederalTaxFormInputs>()

  const placeholderEin = usePlaceholderEin(federalTaxDetails?.hasEin)

  const taxPayerTypeOptions = useMemo(
    () =>
      Object.values(TaxPayerType).map(value => ({
        value: value,
        label: t(`taxPayerType.${value}`),
      })),
    [t],
  )

  const filingFormOptions = useMemo(
    () =>
      Object.values(FilingForm).map(value => ({
        value: value,
        label: t(`filingForm.${value}`),
      })),
    [t],
  )

  return (
    <Flex flexDirection="column" gap={28}>
      <TextField
        name="federalEin"
        label={t('federal_ein_label')}
        description={
          <Trans
            t={t}
            i18nKey="federal_ein_description"
            components={{
              applyLink: (
                <Link
                  href="https://www.irs.gov/businesses/employer-identification-number"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        }
        control={control}
        isRequired
        inputProps={{
          placeholder: placeholderEin,
          onChange: event => {
            setValue('federalEin', normalizeEin(event.target.value))
          },
        }}
      />
      <SelectField
        name="taxPayerType"
        label={t('taxpayer_type_label')}
        description={t('taxpayer_type_description')}
        options={taxPayerTypeOptions}
        isRequired
      />
      <SelectField
        name="filingForm"
        label={t('federal_filing_form_label')}
        description={
          <Trans
            t={t}
            i18nKey="federal_filing_form_description"
            components={{
              irsLink: (
                <Link
                  href="https://www.irs.gov/newsroom/employers-should-you-file-form-944-or-941"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        }
        options={filingFormOptions}
        isRequired
      />
      <TextField
        name="legalName"
        label={t('legal_entity_name_label')}
        description={t('legal_entity_name_description')}
        control={control}
        isRequired
        errorMessage={t('legal_entity_name_error')}
      />
    </Flex>
  )
}
