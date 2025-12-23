import { Trans, useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { SelectField, RadioGroupField, NumberInputField, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const Rev2020Schema = z.object({
  w4DataType: z.literal('rev_2020_w4'),
  filingStatus: z.string().min(1),
  twoJobs: z.string().min(1),
  dependentsAmount: z.number().transform(String),
  otherIncome: z.number().transform(String),
  deductions: z.number().transform(String),
  extraWithholding: z.number().transform(String),
})

const Pre2020Schema = z.object({
  w4DataType: z.literal('pre_2020_w4'),
  filingStatus: z.string().min(1),
  federalWithholdingAllowance: z.number().int(),
  additionalWithholding: z.string(),
})

export const FederalFormSchema = z.discriminatedUnion('w4DataType', [Rev2020Schema, Pre2020Schema])

export type FederalFormInputs = z.input<typeof FederalFormSchema>
export type FederalFormPayload = z.output<typeof FederalFormSchema>

export function FederalForm() {
  const { watch } = useFormContext<FederalFormInputs>()
  const w4DataType = watch('w4DataType')

  if (w4DataType === 'rev_2020_w4') {
    return <Rev2020Form />
  }

  return <Pre2020Form />
}

function Rev2020Form() {
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

function Pre2020Form() {
  const { t } = useTranslation('Employee.FederalTaxes')

  const filingStatusOptions = [
    { value: 'Single', label: t('filingStatusSingle') },
    { value: 'Married', label: t('filingStatusMarried') },
    { value: 'Head of Household', label: t('filingStatusHeadOfHousehold') },
    { value: 'Exempt from withholding', label: t('filingStatusExemptFromWithholding') },
    { value: 'Married, but withhold as Single', label: t('filingStatusMarriedWithholdAsSingle') },
  ]

  return (
    <>
      <NumberInputField
        name="federalWithholdingAllowance"
        isRequired
        label={t('federalWithholdingAllowance')}
        min={0}
        maximumFractionDigits={0}
        errorMessage={t('fieldIsRequired')}
      />
      <SelectField
        name="filingStatus"
        label={t('filingStatus')}
        placeholder={t('federalFilingStatusPlaceholder')}
        description={t('selectWithholdingDescription')}
        options={filingStatusOptions}
        isRequired
        errorMessage={t('validations.federalFilingStatus')}
      />
      <TextInputField
        name="additionalWithholding"
        label={t('additionalWithholding')}
        type="number"
        errorMessage={t('fieldIsRequired')}
      />
    </>
  )
}
