import { Trans, useTranslation } from 'react-i18next'
import { z } from 'zod'
import { SelectField, RadioGroupField, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const Rev2020Schema = z.object({
  filingStatus: z.string().min(1),
  twoJobs: z.string().min(1),
  dependentsAmount: z.number().transform(String),
  otherIncome: z.number().transform(String),
  deductions: z.number().transform(String),
  extraWithholding: z.number().transform(String),
})

export const FederalFormSchema = Rev2020Schema

export type FederalFormInputs = z.input<typeof FederalFormSchema>
export type FederalFormPayload = z.output<typeof FederalFormSchema>

export function FederalForm() {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()

  const filingStatusOptions = [
    { value: 'Single', label: t('filingStatusSingle') },
    { value: 'Married', label: t('filingStatusMarried') },
    { value: 'Head of Household', label: t('filingStatusHeadOfHousehold') },
    { value: 'Exempt from withholding', label: t('filingStatusExemptFromWithholding') },
  ]

  return (
    <>
      <SelectField
        name="filingStatus"
        label={t('federalFilingStatus1c')}
        placeholder={t('federalFilingStatusPlaceholder')}
        description={t('selectWithholdingDescription')}
        options={filingStatusOptions}
        isRequired
        errorMessage={t('validations.federalFilingStatus')}
      />
      <RadioGroupField
        name="twoJobs"
        isRequired
        label={t('multipleJobs2c')}
        errorMessage={t('validations.federalTwoJobs')}
        description={
          <Trans
            i18nKey={'includesSpouseExplanation'}
            t={t}
            components={{
              IrsLink: <Components.Link />,
            }}
          />
        }
        options={[
          { value: 'true', label: t('twoJobYesLabel') },
          { value: 'false', label: t('twoJobNoLabel') },
        ]}
      />
      <NumberInputField
        name="dependentsAmount"
        isRequired
        label={t('dependentsTotalIfApplicable')}
        format="currency"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
      <NumberInputField
        name="otherIncome"
        isRequired
        label={t('otherIncome')}
        format="currency"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
      <NumberInputField
        name="deductions"
        isRequired
        label={t('deductions')}
        format="currency"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
      <NumberInputField
        name="extraWithholding"
        isRequired
        label={t('extraWithholding')}
        format="currency"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
    </>
  )
}
