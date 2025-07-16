import { Trans, useTranslation } from 'react-i18next'
import { z } from 'zod'
import { NumberInputField, RadioGroupField, SelectField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const FederalFormSchema = z.object({
  filingStatus: z.string().min(1),
  twoJobs: z.string().min(1),
  dependentsAmount: z.number().transform(String),
  otherIncome: z.number().transform(String),
  deductions: z.number().transform(String),
  extraWithholding: z.number().transform(String),
  w4DataType: z.enum(['pre_2020_w4', 'rev_2020_w4']),
})

export type FederalFormInputs = z.input<typeof FederalFormSchema>
export type FederalFormPayload = z.output<typeof FederalFormSchema>

export function FederalForm() {
  const { t } = useTranslation('Employee.Taxes')
  const Components = useComponentContext()

  const filingStatusCategories = [
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
        placeholder={t('federalFillingStatusPlaceholder')}
        options={filingStatusCategories}
        isRequired
        errorMessage={t('validations.federalFilingStatus')}
      />
      <RadioGroupField
        name="twoJobs"
        label={t('multipleJobs2c')}
        errorMessage={t('validations.federalTwoJobs')}
        description={
          <Components.Text>
            <Trans
              i18nKey={'includesSpouseExplanation'}
              t={t}
              components={{
                irs_link: <Components.Link />,
              }}
            />
          </Components.Text>
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
