import { NumberField, RadioGroup, Select, SelectCategory } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'
import { Link, ListBoxItem, Radio } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'

export const FederalFormSchema = v.object({
  // filing_status: v.picklist(['Single', 'Married', 'Head of Household', 'Exempt from withholding']),
  filing_status: v.pipe(v.string(), v.nonEmpty()),
  two_jobs: v.pipe(v.string(), v.nonEmpty()),
  dependents_amount: v.pipe(v.number(), v.transform(String)),
  other_income: v.pipe(v.number(), v.transform(String)),
  deductions: v.pipe(v.number(), v.transform(String)),
  extra_withholding: v.pipe(v.number(), v.transform(String)),
  w4_data_type: v.picklist(['pre_2020_w4', 'rev_2020_w4']),
})

export type FederalFormInputs = v.InferInput<typeof FederalFormSchema>
export type FederalFormPayload = v.InferOutput<typeof FederalFormSchema>

export function FederalForm() {
  const { control } = useFormContext<FederalFormInputs>()
  const { t } = useTranslation('Employee.Taxes')
  const { currency } = useLocale()

  const filingStatusCategories = [
    { id: 'Single', name: t('filingStatusSingle') },
    { id: 'Married', name: t('filingStatusMarried') },
    { id: 'Head of Household', name: t('filingStatusHeadOfHousehold') },
    { id: 'Exempt from Witholding', name: t('filingStatusExemptFromWitholding') },
  ]

  return (
    <>
      <Select
        control={control}
        name="filing_status"
        label={t('federalFilingStatus1c')}
        placeholder={t('federalFillingStatusPlaceholder')}
        items={filingStatusCategories}
        errorMessage={t('validations.federalFilingStatus')}
      >
        {category => <ListBoxItem>{category.name}</ListBoxItem>}
      </Select>
      <RadioGroup
        control={control}
        name="two_jobs"
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
      >
        <Radio value="true">{t('twoJobYesLabel')}</Radio>
        <Radio value="false">{t('twoJobNoLabel')}</Radio>
      </RadioGroup>
      <NumberField
        control={control}
        name="dependents_amount"
        isRequired={false}
        label={t('dependentsTotalIfApplicable')}
      />
      <NumberField
        control={control}
        name="other_income"
        isRequired
        label={t('otherIncome')}
        formatOptions={{
          style: 'currency',
          currency: currency,
          currencyDisplay: 'symbol',
        }}
        minValue={0}
      />
      <NumberField
        control={control}
        name="deductions"
        isRequired
        label={t('deductions')}
        formatOptions={{
          style: 'currency',
          currency: currency,
          currencyDisplay: 'symbol',
        }}
        minValue={0}
      />
      <NumberField
        control={control}
        name="extra_withholding"
        isRequired
        label={t('extraWithholding')}
        formatOptions={{
          style: 'currency',
          currency: currency,
          currencyDisplay: 'symbol',
        }}
        minValue={0}
      />
    </>
  )
}
