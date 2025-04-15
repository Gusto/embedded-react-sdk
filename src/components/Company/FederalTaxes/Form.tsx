import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { ListBoxItem, Link } from 'react-aria-components'
import {
  TaxPayerType,
  FilingForm,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import type { FederalTaxFormInputs } from './FederalTaxes'
import { useFederalTaxes } from './FederalTaxes'
import { TextInputField, Select, Flex } from '@/components/Common'
import { usePlaceholderEin, normalizeEin } from '@/helpers/federalEin'

export function Form() {
  const { t } = useTranslation('Company.FederalTaxes')
  const { federalTaxDetails } = useFederalTaxes()
  const { control } = useFormContext<FederalTaxFormInputs>()

  const placeholderEin = usePlaceholderEin(federalTaxDetails?.hasEin)

  const taxPayerTypeOptions = useMemo(
    () =>
      Object.values(TaxPayerType).map(value => ({
        id: value,
        name: t(`taxPayerType.${value}`),
      })),
    [t],
  )

  const filingFormOptions = useMemo(
    () =>
      Object.values(FilingForm).map(value => ({
        id: value,
        name: t(`filingForm.${value}`),
      })),
    [t],
  )

  return (
    <Flex flexDirection="column" gap={28}>
      <TextInputField
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
        isRequired
        transform={e => normalizeEin(e.target.value)}
        placeholder={placeholderEin}
      />
      <Select
        name="taxPayerType"
        label={t('taxpayer_type_label')}
        description={t('taxpayer_type_description')}
        control={control}
        items={taxPayerTypeOptions}
        isRequired
      >
        {option => <ListBoxItem>{option.name}</ListBoxItem>}
      </Select>
      <Select
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
        control={control}
        items={filingFormOptions}
        isRequired
      >
        {option => <ListBoxItem>{option.name}</ListBoxItem>}
      </Select>
      <TextInputField
        name="legalName"
        label={t('legal_entity_name_label')}
        description={t('legal_entity_name_description')}
        isRequired
        errorMessage={t('legal_entity_name_error')}
      />
    </Flex>
  )
}
