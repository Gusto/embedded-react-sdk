import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { PaymentPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishmentchildsupport'
import { useChildSupportGarnishmentForm } from '../shared/useChildSupportGarnishmentForm'
import type { StateFieldEntry, CountyEntry } from '../shared/useChildSupportGarnishmentForm'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ChildSupportFormViewProps {
  employeeId: string
  deduction: Garnishment | null
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}

export function ChildSupportFormView({
  employeeId,
  deduction,
  onSaved,
  onCancel,
}: ChildSupportFormViewProps) {
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const form = useChildSupportGarnishmentForm({
    employeeId,
    garnishmentId: deduction?.uuid,
  })

  if (form.isLoading) {
    return <BaseLayout isLoading error={form.errorHandling.errors} />
  }

  const { Fields } = form.form
  const hasSelection = form.status.selectedAgency !== null

  const handleSubmit = async () => {
    const result = await form.actions.onSubmit()
    if (result) onSaved(result.data, result.mode)
  }

  return (
    <BaseLayout error={form.errorHandling.errors}>
      <SDKFormProvider formHookResult={form}>
        <Form onSubmit={handleSubmit}>
          <Flex flexDirection="column" gap={32}>
            <Components.Heading as="h3">{t('childSupportTitle')}</Components.Heading>

            <Flex flexDirection="column" gap={20}>
              <Fields.State
                label={t('agency')}
                description={t('agencyDescription')}
                getOptionLabel={(entry: StateFieldEntry) => entry.name}
                validationMessages={{ REQUIRED: t('agencyRequired') }}
              />

              {form.status.isManualPaymentRequired && (
                <Components.Alert status="warning" label={t('manualPaymentRequired')} />
              )}

              {hasSelection && (
                <Flex flexDirection="column" gap={20}>
                  {Fields.FipsCode && (
                    <Fields.FipsCode
                      label={t('county')}
                      description={t('countyDescription')}
                      getOptionLabel={(entry: CountyEntry) => entry.county ?? t('allCounties')}
                      validationMessages={{ REQUIRED: t('countyRequired') }}
                    />
                  )}
                  {Fields.CaseNumber && (
                    <Fields.CaseNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'case_number')}
                      description={t('caseNumberDescription')}
                      validationMessages={{ REQUIRED: t('caseNumberRequired') }}
                    />
                  )}
                  {Fields.OrderNumber && (
                    <Fields.OrderNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'order_number')}
                      description={t('orderNumberDescription')}
                      validationMessages={{ REQUIRED: t('orderNumberRequired') }}
                    />
                  )}
                  {Fields.RemittanceNumber && (
                    <Fields.RemittanceNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'remittance_number')}
                      description={t('remittanceNumberDescription')}
                      validationMessages={{ REQUIRED: t('remittanceNumberRequired') }}
                    />
                  )}
                  <Fields.PayPeriodMaximum
                    label={t('totalAmountWithheld')}
                    description={t('totalAmountWithheldDescription')}
                    format="currency"
                    min={0}
                    validationMessages={{
                      REQUIRED: t('payPeriodMaximumRequired'),
                      NEGATIVE_AMOUNT: t('amountNonNegative'),
                    }}
                  />
                  <Fields.Amount
                    label={t('maxPaycheckPercentage')}
                    description={t('maxPaycheckPercentageDescription')}
                    format="percent"
                    min={0}
                    max={100}
                    validationMessages={{
                      REQUIRED: t('amountRequired'),
                      PERCENT_OUT_OF_RANGE: t('percentOutOfRange'),
                    }}
                  />
                  <Fields.PaymentPeriod
                    label={t('per')}
                    description={t('perDescription')}
                    getOptionLabel={(value: PaymentPeriod) => paymentPeriodLabel(t, value)}
                    validationMessages={{ REQUIRED: t('paymentPeriodRequired') }}
                  />
                </Flex>
              )}
            </Flex>
            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={onCancel}>
                {t('cancelCta')}
              </Components.Button>
              {hasSelection && (
                <Components.Button type="submit" isLoading={form.status.isPending}>
                  {t('saveCta')}
                </Components.Button>
              )}
            </ActionsLayout>
          </Flex>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

function requiredAttrLabel(
  selectedAgency: { requiredAttributes?: Array<{ key?: string; label?: string }> } | null,
  key: 'case_number' | 'order_number' | 'remittance_number',
): string {
  const match = selectedAgency?.requiredAttributes?.find(a => a.key === key)
  return match?.label ?? key
}

function paymentPeriodLabel(
  t: ReturnType<typeof useTranslation<'Employee.Deductions'>>['t'],
  value: PaymentPeriod,
): string {
  switch (value) {
    case 'Every week':
      return t('everyWeek')
    case 'Every other week':
      return t('everyOtherWeek')
    case 'Twice per month':
      return t('twicePerMonth')
    case 'Monthly':
      return t('monthly')
  }
}
