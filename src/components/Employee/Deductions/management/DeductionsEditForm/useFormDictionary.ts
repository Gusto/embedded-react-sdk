import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DeductionsFormDictionary } from '../../shared/DeductionsForm'

/**
 * Resolves the shared `DeductionsForm`'s text against management's
 * `Employee.Management.Deductions` namespace. All form copy is owned by
 * management's translation file under the nested `form.*` shape, so partner
 * overrides on `Employee.Management.Deductions` flow into the form text via
 * `t(...)` resolution at render time.
 */
export function useManagementDeductionsFormDictionary(): DeductionsFormDictionary {
  const { t } = useTranslation('Employee.Management.Deductions')

  return useMemo<DeductionsFormDictionary>(
    () => ({
      en: {
        addTitle: t('form.addTitle'),
        editTitle: t('form.editTitle'),
        description: t('form.description'),
        variantLabel: t('form.variantLabel'),
        variantDescription: t('form.variantDescription'),
        garnishmentOption: t('form.garnishmentOption'),
        customOption: t('form.customOption'),
        garnishmentTypeLabel: t('form.garnishmentTypeLabel'),
        types: {
          childSupport: t('form.types.childSupport'),
          federalTaxLien: t('form.types.federalTaxLien'),
          stateTaxLien: t('form.types.stateTaxLien'),
          studentLoan: t('form.types.studentLoan'),
          creditorGarnishment: t('form.types.creditorGarnishment'),
          federalLoan: t('form.types.federalLoan'),
          otherGarnishment: t('form.types.otherGarnishment'),
          custom: t('form.types.custom'),
        },
        standard: {
          descriptionLabel: t('form.standard.descriptionLabel'),
          descriptionRequired: t('form.standard.descriptionRequired'),
          frequencyLabel: t('form.standard.frequencyLabel'),
          frequencyRecurring: t('form.standard.frequencyRecurring'),
          frequencyOneTime: t('form.standard.frequencyOneTime'),
          frequencyRequired: t('form.standard.frequencyRequired'),
          typeLabel: t('form.standard.typeLabel'),
          typePercentage: t('form.standard.typePercentage'),
          typeFixed: t('form.standard.typeFixed'),
          typeRequired: t('form.standard.typeRequired'),
          amountLabel: t('form.standard.amountLabel'),
          amountPercentDescription: t('form.standard.amountPercentDescription'),
          amountFixedDescription: t('form.standard.amountFixedDescription'),
          amountRequired: t('form.standard.amountRequired'),
          amountNonNegative: t('form.standard.amountNonNegative'),
          totalAmountLabel: t('form.standard.totalAmountLabel'),
          totalAmountDescription: t('form.standard.totalAmountDescription'),
          annualMaxLabel: t('form.standard.annualMaxLabel'),
          annualMaxDescription: t('form.standard.annualMaxDescription'),
        },
        childSupport: {
          agencyLabel: t('form.childSupport.agencyLabel'),
          agencyDescription: t('form.childSupport.agencyDescription'),
          agencyRequired: t('form.childSupport.agencyRequired'),
          manualPaymentRequired: t('form.childSupport.manualPaymentRequired'),
          countyLabel: t('form.childSupport.countyLabel'),
          countyDescription: t('form.childSupport.countyDescription'),
          allCounties: t('form.childSupport.allCounties'),
          countyRequired: t('form.childSupport.countyRequired'),
          caseNumberDescription: t('form.childSupport.caseNumberDescription'),
          caseNumberRequired: t('form.childSupport.caseNumberRequired'),
          orderNumberDescription: t('form.childSupport.orderNumberDescription'),
          orderNumberRequired: t('form.childSupport.orderNumberRequired'),
          remittanceNumberDescription: t('form.childSupport.remittanceNumberDescription'),
          remittanceNumberRequired: t('form.childSupport.remittanceNumberRequired'),
          totalAmountWithheld: t('form.childSupport.totalAmountWithheld'),
          totalAmountWithheldDescription: t('form.childSupport.totalAmountWithheldDescription'),
          payPeriodMaximumRequired: t('form.childSupport.payPeriodMaximumRequired'),
          maxPaycheckPercentage: t('form.childSupport.maxPaycheckPercentage'),
          maxPaycheckPercentageDescription: t('form.childSupport.maxPaycheckPercentageDescription'),
          amountRequired: t('form.childSupport.amountRequired'),
          amountNonNegative: t('form.childSupport.amountNonNegative'),
          percentOutOfRange: t('form.childSupport.percentOutOfRange'),
          paymentPeriodLabel: t('form.childSupport.paymentPeriodLabel'),
          paymentPeriodDescription: t('form.childSupport.paymentPeriodDescription'),
          paymentPeriodRequired: t('form.childSupport.paymentPeriodRequired'),
          paymentPeriod: {
            everyWeek: t('form.childSupport.paymentPeriod.everyWeek'),
            everyOtherWeek: t('form.childSupport.paymentPeriod.everyOtherWeek'),
            twicePerMonth: t('form.childSupport.paymentPeriod.twicePerMonth'),
            monthly: t('form.childSupport.paymentPeriod.monthly'),
          },
        },
        actions: {
          save: t('form.actions.save'),
          cancel: t('form.actions.cancel'),
        },
      },
    }),
    [t],
  )
}
