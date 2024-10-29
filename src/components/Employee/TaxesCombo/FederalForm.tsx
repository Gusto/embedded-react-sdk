import { Input, Label, Link, ListBoxItem, Radio } from 'react-aria-components'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { Select, SelectCategory, NumberField, RadioGroup } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'

export const FederalFormSchema = v.object({
  // filing_status: v.picklist(['Single', 'Married', 'Head of Household', 'Exempt from withholding']),
  filing_status: v.pipe(v.string(), v.nonEmpty()),
  two_jobs: v.boolean(),
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
      <Controller
        control={control}
        name="filing_status"
        render={({ field, fieldState: { invalid }, formState: { defaultValues } }) => (
          <Select
            {...field}
            isInvalid={invalid}
            label={t('federalFilingStatus1c')}
            placeholder={t('federalFillingStatusPlaceholder')}
            items={filingStatusCategories}
            defaultSelectedKey={defaultValues?.filing_status}
            errorMessage={t('validations.federalFilingStatus')}
          >
            {(category: SelectCategory) => <ListBoxItem>{category.name}</ListBoxItem>}
          </Select>
        )}
      />
      <RadioGroup
        control={control}
        name="two_jobs"
        label={t('multipleJobs2c')}
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
        <Radio value="true">{t('labels.yes', { ns: 'common' })}</Radio>
        <Radio value="false">{t('labels.no', { ns: 'common' })}</Radio>
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
