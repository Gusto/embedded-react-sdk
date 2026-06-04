import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { FederalTaxesViewDictionary } from '../shared'

/**
 * Resolves the shared `FederalTaxesView`'s text against onboarding's
 * `Employee.FederalTaxes` namespace. Partner overrides supplied through the
 * onboarding block's `dictionary` prop flow into the view text via `t(...)`
 * resolution at render time.
 */
export function useOnboardingFederalTaxesViewDictionary(): FederalTaxesViewDictionary {
  const { t } = useTranslation('Employee.FederalTaxes')

  return useMemo<FederalTaxesViewDictionary>(
    () => ({
      en: {
        federalTaxesTitle: t('federalTaxesTitle'),
        irsCalculator: t('irsCalculator'),
        federalFilingStatus1c: t('federalFilingStatus1c'),
        federalFilingStatusPlaceholder: t('federalFilingStatusPlaceholder'),
        selectWithholdingDescription: t('selectWithholdingDescription'),
        filingStatusSingle: t('filingStatusSingle'),
        filingStatusMarried: t('filingStatusMarried'),
        filingStatusHeadOfHousehold: t('filingStatusHeadOfHousehold'),
        filingStatusExemptFromWithholding: t('filingStatusExemptFromWithholding'),
        multipleJobs2c: t('multipleJobs2c'),
        includesSpouseExplanation: t('includesSpouseExplanation'),
        twoJobYesLabel: t('twoJobYesLabel'),
        twoJobNoLabel: t('twoJobNoLabel'),
        dependentsTotalIfApplicable: t('dependentsTotalIfApplicable'),
        otherIncome: t('otherIncome'),
        deductions: t('deductions'),
        extraWithholding: t('extraWithholding'),
        fieldIsRequired: t('fieldIsRequired'),
        validations: {
          federalFilingStatus: t('validations.federalFilingStatus'),
          federalTwoJobs: t('validations.federalTwoJobs'),
        },
      },
    }),
    [t],
  )
}
