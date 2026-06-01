import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import type {
  Garnishment,
  GarnishmentType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { Control } from 'react-hook-form'
import { useDeductionForm } from '../shared/useDeductionForm'
import type { DeductionFormData } from '../shared/useDeductionForm'
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
  /** Section heading shown above the form. The parent picker is responsible
   *  for translating the garnishment-type label so this component doesn't
   *  need to repeat the labels mapping. */
  title: string
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}

export function StandardDeductionForm({
  employeeId,
  deduction,
  courtOrdered,
  garnishmentType,
  title,
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
  return (
    <ReadyForm
      form={form}
      Fields={Fields}
      Components={Components}
      t={t}
      title={title}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  )
}

// Split into a child component so we can call `useWatch` on the form's control
// only once the hook is in its ready state (the control reference exists then).
function ReadyForm({
  form,
  Fields,
  Components,
  t,
  title,
  onSaved,
  onCancel,
}: {
  form: Extract<ReturnType<typeof useDeductionForm>, { isLoading: false }>
  Fields: Extract<ReturnType<typeof useDeductionForm>, { isLoading: false }>['form']['Fields']
  Components: ReturnType<typeof useComponentContext>
  t: ReturnType<typeof useTranslation<'Employee.Deductions'>>['t']
  title: string
  onSaved: (deduction: Garnishment, mode: 'create' | 'update') => void
  onCancel: () => void
}) {
  // useWatch subscribes to changes; getValues only reads once. We need the
  // subscription because `Fields.Amount`'s `format` and `description` props
  // need to re-render when the user toggles Percentage / Fixed amount.
  // The RadioGroup's options carry string values (`'true'`/`'false'`), which
  // round-trip into form state as strings — only `coerceStringBoolean` in the
  // zod preprocessor turns them into actual booleans at validation time. So
  // here we explicitly compare against both shapes; `Boolean('false')` would
  // be truthy and surface the wrong copy under the Amount field.
  const watchedDeductAsPercentageRaw = useWatch({
    control: form.form.hookFormInternals.formMethods.control as Control<DeductionFormData>,
    name: 'deductAsPercentage',
  }) as boolean | 'true' | 'false' | undefined
  const watchedDeductAsPercentage =
    watchedDeductAsPercentageRaw === true || watchedDeductAsPercentageRaw === 'true'

  const handleSubmit = async () => {
    const result = await form.actions.onSubmit()
    if (result) onSaved(result.data, result.mode)
  }

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
