import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import {
  TaxPayerType,
  FilingForm,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { useFederalTaxes } from './useFederalTaxes'
import { TextInputField, SelectField, Flex } from '@/components/Common'
import { usePlaceholderEin, normalizeEin } from '@/helpers/federalEin'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Form() {
  const { t } = useTranslation('Company.FederalTaxes')
  const { federalTaxDetails } = useFederalTaxes()
  const Components = useComponentContext()

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
      <TextInputField
        name="federalEin"
        label={t('federalEinLabel')}
        description={
          <Trans
            t={t}
            i18nKey="federalEinDescription"
            components={{
              applyLink: (
                <Components.Link
                  href="https://www.irs.gov/businesses/employer-identification-number"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        }
        isRequired
        transform={normalizeEin}
        placeholder={placeholderEin}
      />
      <SelectField
        name="taxPayerType"
        label={t('taxpayerTypeLabel')}
        description={t('taxpayerTypeDescription')}
        options={taxPayerTypeOptions}
        isRequired
      />
      <SelectField
        name="filingForm"
        label={t('federalFilingFormLabel')}
        description={
          <Trans
            t={t}
            i18nKey="federalFilingFormDescription"
            components={{
              irsLink: (
                <Components.Link
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
      <TextInputField
        name="legalName"
        label={t('legalEntityNameLabel')}
        description={t('legalEntityNameDescription')}
        isRequired
        errorMessage={t('legalEntityNameError')}
      />
    </Flex>
  )
}
