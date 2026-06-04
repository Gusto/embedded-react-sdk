import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { PaymentPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishmentchildsupport'
import { useChildSupportGarnishmentForm } from '../useChildSupportGarnishmentForm'
import type { StateFieldEntry, CountyEntry } from '../useChildSupportGarnishmentForm'
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
  const { t } = useTranslation('Employee.DeductionsForm')
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
            <Components.Heading as="h3">{t('types.childSupport')}</Components.Heading>

            <Flex flexDirection="column" gap={20}>
              <Fields.State
                label={t('childSupport.agencyLabel')}
                description={t('childSupport.agencyDescription')}
                getOptionLabel={(entry: StateFieldEntry) => entry.name}
                validationMessages={{ REQUIRED: t('childSupport.agencyRequired') }}
              />

              {form.status.isManualPaymentRequired && (
                <Components.Alert
                  status="warning"
                  label={t('childSupport.manualPaymentRequired')}
                />
              )}

              {hasSelection && (
                <Flex flexDirection="column" gap={20}>
                  {Fields.FipsCode && (
                    <Fields.FipsCode
                      label={t('childSupport.countyLabel')}
                      description={t('childSupport.countyDescription')}
                      getOptionLabel={(entry: CountyEntry) =>
                        entry.county ?? t('childSupport.allCounties')
                      }
                      validationMessages={{ REQUIRED: t('childSupport.countyRequired') }}
                    />
                  )}
                  {Fields.CaseNumber && (
                    <Fields.CaseNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'case_number')}
                      description={t('childSupport.caseNumberDescription')}
                      validationMessages={{ REQUIRED: t('childSupport.caseNumberRequired') }}
                    />
                  )}
                  {Fields.OrderNumber && (
                    <Fields.OrderNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'order_number')}
                      description={t('childSupport.orderNumberDescription')}
                      validationMessages={{ REQUIRED: t('childSupport.orderNumberRequired') }}
                    />
                  )}
                  {Fields.RemittanceNumber && (
                    <Fields.RemittanceNumber
                      label={requiredAttrLabel(form.status.selectedAgency, 'remittance_number')}
                      description={t('childSupport.remittanceNumberDescription')}
                      validationMessages={{
                        REQUIRED: t('childSupport.remittanceNumberRequired'),
                      }}
                    />
                  )}
                  <Fields.PayPeriodMaximum
                    label={t('childSupport.totalAmountWithheld')}
                    description={t('childSupport.totalAmountWithheldDescription')}
                    format="currency"
                    min={0}
                    validationMessages={{
                      REQUIRED: t('childSupport.payPeriodMaximumRequired'),
                      NEGATIVE_AMOUNT: t('childSupport.amountNonNegative'),
                    }}
                  />
                  <Fields.Amount
                    label={t('childSupport.maxPaycheckPercentage')}
                    description={t('childSupport.maxPaycheckPercentageDescription')}
                    format="percent"
                    min={0}
                    max={100}
                    validationMessages={{
                      REQUIRED: t('childSupport.amountRequired'),
                      PERCENT_OUT_OF_RANGE: t('childSupport.percentOutOfRange'),
                    }}
                  />
                  <Fields.PaymentPeriod
                    label={t('childSupport.paymentPeriodLabel')}
                    description={t('childSupport.paymentPeriodDescription')}
                    getOptionLabel={(value: PaymentPeriod) => paymentPeriodLabel(t, value)}
                    validationMessages={{ REQUIRED: t('childSupport.paymentPeriodRequired') }}
                  />
                </Flex>
              )}
            </Flex>
            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={onCancel}>
                {t('actions.cancel')}
              </Components.Button>
              {hasSelection && (
                <Components.Button type="submit" isLoading={form.status.isPending}>
                  {t('actions.save')}
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
  t: ReturnType<typeof useTranslation<'Employee.DeductionsForm'>>['t'],
  value: PaymentPeriod,
): string {
  switch (value) {
    case 'Every week':
      return t('childSupport.paymentPeriod.everyWeek')
    case 'Every other week':
      return t('childSupport.paymentPeriod.everyOtherWeek')
    case 'Twice per month':
      return t('childSupport.paymentPeriod.twicePerMonth')
    case 'Monthly':
      return t('childSupport.paymentPeriod.monthly')
  }
}
