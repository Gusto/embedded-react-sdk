import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useCompaniesSuspensionsSuspendMutation } from '@gusto/embedded-api/react-query/companiesSuspensionsSuspend'
import type { LeavingFor } from '@gusto/embedded-api/models/operations/postcompaniescompanyuuidsuspensions'
import { Reason } from '@gusto/embedded-api/models/operations/postcompaniescompanyuuidsuspensions'
import { createSuspensionFormSchema } from './SuspensionFormSchema'
import type { SuspensionFormData, SuspensionFormProps } from './SuspensionFormTypes'
import { SuspensionFormPresentation } from './SuspensionFormPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { companyEvents } from '@/shared/constants'
import { Form } from '@/components/Common/Form'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Collects the reason and tax-reconciliation preferences for suspending ("cancelling") a company's
 * Gusto account, then submits the suspension.
 *
 * @remarks
 * Requires the `companySuspension` unstable feature flag to be enabled via {@link GustoProvider}.
 *
 * The visible fields adapt to the selections: `leavingFor` appears only when the reason is
 * "switching to a new provider"; warnings surface for reasons and destinations that must be handled
 * by Customer Support (`changing_ein_or_entity_type`, `gusto_com`); the tax-filing checkboxes appear
 * only when Gusto is paying outstanding taxes, and a responsibility warning appears when refunding.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/suspension/created` | The suspension was successfully created | {@link APIModels.CompanySuspension} |
 *
 * @param props - {@link SuspensionFormProps} plus base component props.
 * @returns The rendered suspension form.
 * @alpha
 */
export function SuspensionForm(props: SuspensionFormProps) {
  useUnstableFeature('companySuspension', { throwIfDisabled: true })
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, dictionary }: SuspensionFormProps) {
  useI18n('Company.Suspension.Form')
  useComponentDictionary('Company.Suspension.Form', dictionary)

  const { t } = useTranslation('Company.Suspension.Form')
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: suspendCompany, isPending } = useCompaniesSuspensionsSuspendMutation()

  const methods = useForm<SuspensionFormData>({
    resolver: zodResolver(createSuspensionFormSchema(code => t(`errors.${code}`))),
    defaultValues: {
      reason: undefined,
      leavingFor: undefined,
      comments: '',
      reconcileTaxMethod: undefined,
      fileQuarterlyForms: false,
      fileYearlyForms: false,
    },
  })

  const onSubmit = async (data: SuspensionFormData) => {
    await baseSubmitHandler(data, async payload => {
      const includeLeavingFor =
        payload.reason === Reason.SwitchingProvider && payload.leavingFor != null
      const commentsTrimmed = payload.comments?.trim()

      const response = await suspendCompany({
        request: {
          companyUuid: companyId,
          requestBody: {
            reason: payload.reason!,
            reconcileTaxMethod: payload.reconcileTaxMethod!,
            fileQuarterlyForms: payload.fileQuarterlyForms,
            fileYearlyForms: payload.fileYearlyForms,
            ...(includeLeavingFor ? { leavingFor: payload.leavingFor as LeavingFor } : {}),
            ...(commentsTrimmed ? { comments: commentsTrimmed } : {}),
          },
        },
      })

      onEvent(companyEvents.COMPANY_SUSPENSION_CREATED, response.companySuspension)
    })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <SuspensionFormPresentation isPending={isPending} />
      </Form>
    </FormProvider>
  )
}
