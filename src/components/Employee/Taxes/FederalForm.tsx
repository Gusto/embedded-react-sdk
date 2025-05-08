import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { NumberInputField, RadioGroupField, SelectField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const FederalFormSchema = v.object({
  filingStatus: v.pipe(v.string(), v.nonEmpty()),
  twoJobs: v.pipe(v.string(), v.nonEmpty()),
  dependentsAmount: v.pipe(v.number(), v.transform(String)),
  otherIncome: v.pipe(v.number(), v.transform(String)),
  deductions: v.pipe(v.number(), v.transform(String)),
  extraWithholding: v.pipe(v.number(), v.transform(String)),
  w4DataType: v.picklist(['pre_2020_w4', 'rev_2020_w4']),
})

export type FederalFormInputs = v.InferInput<typeof FederalFormSchema>
export type FederalFormPayload = v.InferOutput<typeof FederalFormSchema>

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
          <Trans
            i18nKey={'includesSpouseExplanation'}
            t={t}
            components={{
              irs_link: <Components.Link />,
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
