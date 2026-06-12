import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DeductionsFormDictionary } from '../shared/DeductionsForm'

/**
 * Resolves the shared `DeductionsForm`'s text against onboarding's existing
 * `Employee.Deductions` namespace.
 *
 * The mapping bridges onboarding's historical flat key names
 * (`addDeductionTitle`, `descriptionLabelV2`, `agency`, `per`, …) onto the
 * form's nested shape (`addTitle`, `standard.descriptionLabel`,
 * `childSupport.agencyLabel`, `childSupport.paymentPeriodLabel`, …). Keeping
 * the source keys unchanged preserves backward compatibility for partners
 * overriding them through the onboarding block's `dictionary` prop.
 *
 * @internal
 */
export function useOnboardingDeductionsFormDictionary(): DeductionsFormDictionary {
  const { t } = useTranslation('Employee.Deductions')

  return useMemo<DeductionsFormDictionary>(
    () => ({
      en: {
        addTitle: t('addDeductionTitle'),
        editTitle: t('editDeductionTitle'),
        description: t('externalPostTaxDeductionsDescription'),
        variantLabel: t('deductionTypeLabel'),
        variantDescription: t('deductionTypeRadioLabel'),
        garnishmentOption: t('garnishmentOption'),
        customOption: t('customDeductionOption'),
        garnishmentTypeLabel: t('garnishmentType'),
        types: {
          childSupport: t('childSupportTitle'),
          federalTaxLien: t('federalTaxLien'),
          stateTaxLien: t('stateTaxLien'),
          studentLoan: t('studentLoan'),
          creditorGarnishment: t('creditorGarnishment'),
          federalLoan: t('federalLoan'),
          otherGarnishment: t('otherGarnishment'),
          custom: t('customDeductionTitle'),
        },
        standard: {
          descriptionLabel: t('descriptionLabelV2'),
          descriptionRequired: t('descriptionRequired'),
          frequencyLabel: t('frequencyLabel'),
          frequencyRecurring: t('frequencyRecurringOptionV2'),
          frequencyOneTime: t('frequencyOneTimeOptionV2'),
          frequencyRequired: t('frequencyRequired'),
          typeLabel: t('deductionTypeLabelV2'),
          typePercentage: t('deductionTypePercentageOptionV2'),
          typeFixed: t('deductionTypeFixedAmountOption'),
          typeRequired: t('deductionTypeRequired'),
          amountLabel: t('deductionAmountLabel'),
          amountPercentDescription: t('deductionAmountDescriptionPercentage'),
          amountFixedDescription: t('deductionAmountDescriptionFixed'),
          amountRequired: t('amountRequired'),
          amountNonNegative: t('amountNonNegative'),
          totalAmountLabel: t('totalAmountLabel'),
          totalAmountDescription: t('totalAmountDescription'),
          annualMaxLabel: t('annualMaxLabel'),
          annualMaxDescription: t('annualMaxDescription'),
        },
        childSupport: {
          agencyLabel: t('agency'),
          agencyDescription: t('agencyDescription'),
          agencyRequired: t('agencyRequired'),
          manualPaymentRequired: t('manualPaymentRequired'),
          countyLabel: t('county'),
          countyDescription: t('countyDescription'),
          allCounties: t('allCounties'),
          countyRequired: t('countyRequired'),
          caseNumberDescription: t('caseNumberDescription'),
          caseNumberRequired: t('caseNumberRequired'),
          orderNumberDescription: t('orderNumberDescription'),
          orderNumberRequired: t('orderNumberRequired'),
          remittanceNumberDescription: t('remittanceNumberDescription'),
          remittanceNumberRequired: t('remittanceNumberRequired'),
          totalAmountWithheld: t('totalAmountWithheld'),
          totalAmountWithheldDescription: t('totalAmountWithheldDescription'),
          payPeriodMaximumRequired: t('payPeriodMaximumRequired'),
          maxPaycheckPercentage: t('maxPaycheckPercentage'),
          maxPaycheckPercentageDescription: t('maxPaycheckPercentageDescription'),
          amountRequired: t('amountRequired'),
          amountNonNegative: t('amountNonNegative'),
          percentOutOfRange: t('percentOutOfRange'),
          paymentPeriodLabel: t('per'),
          paymentPeriodDescription: t('perDescription'),
          paymentPeriodRequired: t('paymentPeriodRequired'),
          paymentPeriod: {
            everyWeek: t('everyWeek'),
            everyOtherWeek: t('everyOtherWeek'),
            twicePerMonth: t('twicePerMonth'),
            monthly: t('monthly'),
          },
        },
        actions: {
          save: t('saveCta'),
          cancel: t('cancelCta'),
        },
      },
    }),
    [t],
  )
}
