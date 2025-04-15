import { Link, ListBoxItem } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { NumberInputField, RadioGroup, Select } from '@/components/Common'

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
  const { control } = useFormContext<FederalFormInputs>()
  const { t } = useTranslation('Employee.Taxes')

  const filingStatusCategories = [
    { id: 'Single', name: t('filingStatusSingle') },
    { id: 'Married', name: t('filingStatusMarried') },
    { id: 'Head of Household', name: t('filingStatusHeadOfHousehold') },
    { id: 'Exempt from withholding', name: t('filingStatusExemptFromWithholding') },
  ]

  return (
    <>
      <Select
        control={control}
        name="filingStatus"
        label={t('federalFilingStatus1c')}
        placeholder={t('federalFillingStatusPlaceholder')}
        items={filingStatusCategories}
        isRequired
        errorMessage={t('validations.federalFilingStatus')}
      >
        {category => <ListBoxItem>{category.name}</ListBoxItem>}
      </Select>
      <RadioGroup
        control={control}
        name="twoJobs"
        label={t('multipleJobs2c')}
        errorMessage={t('validations.federalTwoJobs')}
        description={
          <Trans
            i18nKey={'includesSpouseExplanation'}
            t={t}
            components={{
              irs_link: <Link />,
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
        currencyDisplay="symbol"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
      <NumberInputField
        name="deductions"
        isRequired
        label={t('deductions')}
        format="currency"
        currencyDisplay="symbol"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
      <NumberInputField
        name="extraWithholding"
        isRequired
        label={t('extraWithholding')}
        format="currency"
        currencyDisplay="symbol"
        min={0}
        errorMessage={t('fieldIsRequired')}
      />
    </>
  )
}
