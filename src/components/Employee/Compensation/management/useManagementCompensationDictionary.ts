import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AddCompensationFormDictionary } from '../shared/AddCompensationFormBody'

/**
 * Resolves management's `Employee.Management.Compensation` copy onto the
 * `Employee.Compensation` keys that the shared `AddCompensationFormBody` reads,
 * so management surfaces (add first job, add another job) render their own copy
 * while staying isolated from onboarding. Partner overrides on
 * `Employee.Management.Compensation` flow through here into the rendered form.
 * Interpolated strings keep their `{{limit}}` placeholder intact so the form
 * body interpolates the live value at render.
 */
export function useManagementCompensationDictionary(): AddCompensationFormDictionary {
  const { t } = useTranslation('Employee.Management.Compensation')

  return useMemo<AddCompensationFormDictionary>(
    () => ({
      en: {
        jobTitle: t('jobTitle'),
        hireDate: t('hireDate'),
        employeeClassification: t('employeeClassification'),
        classificationLink: t('classificationLink'),
        wageLabel: t('wageLabel'),
        wageFrequencyLabel: t('wageFrequencyLabel'),
        paymentUnitDescription: t('paymentUnitDescription'),
        adjustForMinimumWage: t('adjustForMinimumWage'),
        adjustForMinimumWageDescription: t('adjustForMinimumWageDescription'),
        minimumWageLabel: t('minimumWageLabel'),
        minimumWageDescription: t('minimumWageDescription'),
        effectiveDate: t('effectiveDate'),
        twoPercentStakeholderLabel: t('twoPercentStakeholderLabel'),
        stateWcCoveredLabel: t('stateWcCoveredLabel'),
        stateWcCoveredDescription: t('stateWcCoveredDescription'),
        stateWcCoveredOptions: {
          yes: t('stateWcCoveredOptions.yes'),
          no: t('stateWcCoveredOptions.no'),
        },
        stateWcClassCodeLabel: t('stateWcClassCodeLabel'),
        stateWcClassCodeDescription: t('stateWcClassCodeDescription'),
        cancelNewJobCta: t('cancelNewJobCta'),
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
          title: t('validations.title'),
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
    [t],
  )
}
