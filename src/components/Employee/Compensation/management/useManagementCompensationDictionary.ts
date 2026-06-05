import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AddCompensationFormDictionary } from '../shared/AddCompensationFormBody'

/**
 * Selects which management copy maps onto the shared form's title/date/cancel
 * keys. The add surfaces (first job, another job) and the edit surfaces (edit a
 * job's compensation, edit a pending compensation) carry their own distinct copy
 * in `Employee.Management.Compensation` for these labels, so each surface routes
 * its own keys through the shared body.
 */
export type ManagementCompensationDictionaryVariant = 'add' | 'edit'

/**
 * Resolves management's `Employee.Management.Compensation` copy onto the
 * `Employee.Compensation` keys that the shared `AddCompensationFormBody` reads,
 * so management surfaces render their own copy while staying isolated from
 * onboarding. Partner overrides on `Employee.Management.Compensation` flow
 * through here into the rendered form. Interpolated strings keep their
 * `{{limit}}` placeholder intact so the form body interpolates the live value at
 * render.
 *
 * Pass `variant: 'edit'` for the edit flows: they reuse the same field layout but
 * carry edit-specific labels (`jobTitleLabel`, `hireDateLabel`,
 * `effectiveDateLabel`, `twoPercentShareholderLabel`, `cancelCta`) and the
 * `validations.jobTitleSentence` message, which are routed onto the shared keys
 * here. The add variant keeps the add-flow labels (`jobTitle`, `hireDate`,
 * `effectiveDate`, `twoPercentStakeholderLabel`, `cancelNewJobCta`,
 * `validations.title`).
 */
export function useManagementCompensationDictionary(
  variant: ManagementCompensationDictionaryVariant = 'add',
): AddCompensationFormDictionary {
  const { t } = useTranslation('Employee.Management.Compensation')

  return useMemo<AddCompensationFormDictionary>(
    () => ({
      en: {
        jobTitle: variant === 'edit' ? t('jobTitleLabel') : t('jobTitle'),
        hireDate: variant === 'edit' ? t('hireDateLabel') : t('hireDate'),
        employeeClassification: t('employeeClassification'),
        classificationLink: t('classificationLink'),
        wageLabel: t('wageLabel'),
        wageFrequencyLabel: t('wageFrequencyLabel'),
        paymentUnitDescription: t('paymentUnitDescription'),
        adjustForMinimumWage: t('adjustForMinimumWage'),
        adjustForMinimumWageDescription: t('adjustForMinimumWageDescription'),
        minimumWageLabel: t('minimumWageLabel'),
        minimumWageDescription: t('minimumWageDescription'),
        effectiveDate: variant === 'edit' ? t('effectiveDateLabel') : t('effectiveDate'),
        twoPercentStakeholderLabel:
          variant === 'edit' ? t('twoPercentShareholderLabel') : t('twoPercentStakeholderLabel'),
        stateWcCoveredLabel: t('stateWcCoveredLabel'),
        stateWcCoveredDescription: t('stateWcCoveredDescription'),
        stateWcCoveredOptions: {
          yes: t('stateWcCoveredOptions.yes'),
          no: t('stateWcCoveredOptions.no'),
        },
        stateWcClassCodeLabel: t('stateWcClassCodeLabel'),
        stateWcClassCodeDescription: t('stateWcClassCodeDescription'),
        cancelNewJobCta: variant === 'edit' ? t('cancelCta') : t('cancelNewJobCta'),
        flsaStatusLabels: {
          'Commission Only Exempt': t('flsaStatusLabels.Commission Only Exempt'),
          'Commission Only Nonexempt': t('flsaStatusLabels.Commission Only Nonexempt'),
          Exempt: t('flsaStatusLabels.Exempt'),
          Nonexempt: t('flsaStatusLabels.Nonexempt'),
          Owner: t('flsaStatusLabels.Owner'),
          'Salaried Nonexempt': t('flsaStatusLabels.Salaried Nonexempt'),
        },
        paymentUnitOptions: {
          Hour: t('paymentUnitOptions.Hour'),
          Month: t('paymentUnitOptions.Month'),
          Paycheck: t('paymentUnitOptions.Paycheck'),
          Week: t('paymentUnitOptions.Week'),
          Year: t('paymentUnitOptions.Year'),
        },
        commissionAlerts: {
          federalMinimumPay: {
            label: t('commissionAlerts.federalMinimumPay.label'),
            body: t('commissionAlerts.federalMinimumPay.body'),
          },
          minimumWage: {
            label: t('commissionAlerts.minimumWage.label'),
            body: t('commissionAlerts.minimumWage.body'),
          },
          ownerSalary: {
            label: t('commissionAlerts.ownerSalary.label'),
          },
        },
        validations: {
          title: variant === 'edit' ? t('validations.jobTitleSentence') : t('validations.title'),
          hireDate: t('validations.hireDate'),
          classificationChangeNotification: t('validations.classificationChangeNotification'),
          exemptThreshold: t('validations.exemptThreshold', { limit: '{{limit}}' }),
          rate: t('validations.rate'),
          nonZeroRate: t('validations.nonZeroRate'),
          rateExemptThreshold: t('validations.rateExemptThreshold', { limit: '{{limit}}' }),
          paymentUnit: t('validations.paymentUnit'),
          minimumWage: t('validations.minimumWage'),
          stateWcClassCode: t('validations.stateWcClassCode'),
          effectiveDate: t('validations.effectiveDate'),
          effectiveDateBeforeHire: t('validations.effectiveDateBeforeHire'),
          effectiveDateBeforeMin: t('validations.effectiveDateBeforeMin'),
        },
      },
    }),
    [t, variant],
  )
}
