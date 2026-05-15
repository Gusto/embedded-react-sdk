import { useTranslation } from 'react-i18next'
import type {
  Garnishment,
  GarnishmentType,
} from '@gusto/embedded-api/models/components/garnishment'
import { useDeductionForm } from '../shared/useDeductionForm'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface StandardDeductionFormProps {
  employeeId: string
  deduction: Garnishment | null
  /** Court-ordered garnishments require `garnishmentType`. Custom deductions don't. */
  courtOrdered: boolean
  /** Only meaningful when `courtOrdered: true`. Selects the garnishment type
   *  on create. Ignored in edit mode (the existing type is preserved). */
  garnishmentType?: GarnishmentType
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}

export function StandardDeductionForm({
  employeeId,
  deduction,
  courtOrdered,
  garnishmentType,
  onSaved,
  onCancel,
}: StandardDeductionFormProps) {
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const form = useDeductionForm({
    employeeId,
    garnishmentId: deduction?.uuid,
    courtOrdered,
    defaultValues: courtOrdered && garnishmentType ? { garnishmentType } : undefined,
  })

  if (form.isLoading) {
    return <BaseLayout isLoading error={form.errorHandling.errors} />
  }

  const { Fields } = form.form
  // Read once for adornment-less label/description switching; the field types
  // for the schema don't expose adornments through HookField, but the
  // description text and number format still vary by mode.
  const watchedDeductAsPercentage =
    form.form.hookFormInternals.formMethods.getValues('deductAsPercentage')

  const handleSubmit = async () => {
    const result = await form.actions.onSubmit()
    if (result) onSaved(result.data, result.mode)
  }

  const title = courtOrdered
    ? garnishmentType
      ? // Translated label per type — pulled by the parent (DeductionsForm)
        // when the user picks; here we just show the section title.
        t('childSupportTitle')
      : t('childSupportTitle')
    : t('customDeductionTitle')

  return (
    <BaseLayout error={form.errorHandling.errors}>
      <SDKFormProvider formHookResult={form}>
        <Form onSubmit={handleSubmit}>
          <Flex flexDirection="column" gap={32}>
            <Components.Heading as="h3">{title}</Components.Heading>
            <Flex flexDirection="column" gap={20}>
              <Flex flexDirection="column" gap={20}>
                <Fields.Description
                  label={t('descriptionLabelV2')}
                  validationMessages={{ REQUIRED: t('descriptionRequired') }}
                />
                <Fields.Recurring
                  label={t('frequencyLabel')}
                  getOptionLabel={(value: boolean) =>
                    value ? t('frequencyRecurringOptionV2') : t('frequencyOneTimeOptionV2')
                  }
                  validationMessages={{ REQUIRED: t('frequencyRequired') }}
                />
                <Fields.DeductAsPercentage
                  label={t('deductionTypeLabelV2')}
                  getOptionLabel={(value: boolean) =>
                    value
                      ? t('deductionTypePercentageOptionV2')
                      : t('deductionTypeFixedAmountOption')
                  }
                  validationMessages={{ REQUIRED: t('deductionTypeRequired') }}
                />
                <Fields.Amount
                  label={t('deductionAmountLabel')}
                  format={watchedDeductAsPercentage ? 'percent' : 'currency'}
                  description={
                    watchedDeductAsPercentage
                      ? t('deductionAmountDescriptionPercentage')
                      : t('deductionAmountDescriptionFixed')
                  }
                  min={0}
                  validationMessages={{
                    REQUIRED: t('amountRequired'),
                    NEGATIVE_AMOUNT: t('amountNonNegative'),
                  }}
                />
              </Flex>
              {Fields.TotalAmount && Fields.AnnualMaximum && (
                <Flex flexDirection="column" gap={20}>
                  <Fields.TotalAmount
                    label={t('totalAmountLabel')}
                    description={t('totalAmountDescription')}
                    format="currency"
                    min={0}
                    validationMessages={{
                      NEGATIVE_AMOUNT: t('amountNonNegative'),
                    }}
                  />
                  <Fields.AnnualMaximum
                    label={t('annualMaxLabel')}
                    description={t('annualMaxDescription')}
                    format="currency"
                    min={0}
                    validationMessages={{
                      NEGATIVE_AMOUNT: t('amountNonNegative'),
                    }}
                  />
                </Flex>
              )}
            </Flex>
            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={onCancel}>
                {t('cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={form.status.isPending}>
                {t('saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
