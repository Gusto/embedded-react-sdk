import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import { z } from 'zod'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StateTaxesFormPresentation } from './StateTaxesFormPresentation'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Form as HtmlForm } from '@/components/Common/Form'
import { componentEvents } from '@/shared/constants'
import { useBase } from '@/components/Base'

interface StateTaxesFormProps extends CommonComponentInterface {
  companyId: string
  state: string
}

export function StateTaxesForm(props: StateTaxesFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, state }: StateTaxesFormProps) {
  useI18n('Company.StateTaxes')
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { data } = useTaxRequirementsGetSuspense({ companyUuid: companyId, state })
  const stateTaxRequirements = data.taxRequirementsState!

  const { mutateAsync: updateStateTax, isPending: isPendingUpdate } =
    useTaxRequirementsUpdateStateMutation()

  const { dynamicSchema, defaultValues } = useMemo(() => {
    const schemaShape: Record<string, z.ZodObject> = {}
    const values: Partial<Record<string, Record<string, string | boolean | number | undefined>>> =
      {}

    stateTaxRequirements.requirementSets?.forEach(requirementSet => {
      if (!requirementSet.key) return

      const requirementSetKey = requirementSet.key
      const requirementShape: Record<string, z.ZodType> = {}
      const requirementValues: Record<string, string | boolean | number | undefined> = {}

      requirementSet.requirements?.forEach(requirement => {
        if (!requirement.key) return

        const requirementKey = requirement.key

        const isPercentField =
          requirement.metadata?.type === 'tax_rate' || requirement.metadata?.type === 'percent'

        if (requirement.metadata?.type === 'radio') {
          requirementValues[requirementKey] = requirement.value ?? undefined
        } else {
          requirementValues[requirementKey] = requirement.value ? String(requirement.value) : ''
        }

        let fieldSchema: z.ZodType = z.string().optional()

        const validation = requirement.metadata?.validation

        if (validation) {
          if (isPercentField && validation.type === 'one_of') {
            const oneOfValues = validation.rates as string[]
            fieldSchema = z
              .string()
              .optional()
              .refine(val => !val || oneOfValues.includes(val), {
                message: t('validations.oneOf', { values: oneOfValues.join(', ') }),
              })
          }
        }

        if (requirement.metadata?.type === 'radio') {
          fieldSchema = z.boolean().optional()
        }
        requirementShape[requirementKey] = fieldSchema
      })

      if (Object.keys(requirementShape).length > 0) {
        schemaShape[requirementSetKey] = z.object(requirementShape)
        values[requirementSetKey] = requirementValues
      }
    })

    const finalSchema = z.object(schemaShape)

    return {
      dynamicSchema: finalSchema,
      defaultValues: values as z.infer<typeof finalSchema>,
    }
  }, [stateTaxRequirements, t])

  type InferredFormInputs = z.infer<typeof dynamicSchema>

  const { control, ...methods } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
  })

  const onSubmit = async (formData: InferredFormInputs) => {
    await baseSubmitHandler(formData, async payload => {
      const requirementSets = stateTaxRequirements.requirementSets
        ?.filter(rs => rs.key && payload[rs.key])
        .map(requirementSet => {
          const requirementSetKey = requirementSet.key as string
          const payloadSet = payload[requirementSetKey] as Record<string, unknown>

          return {
            state,
            key: requirementSetKey,
            effectiveFrom: requirementSet.effectiveFrom,
            requirements: Object.entries(payloadSet).map(([reqKey, value]) => ({
              key: reqKey,
              value: String(value),
            })),
          }
        })
      await updateStateTax({
        request: {
          companyUuid: companyId,
          requestBody: { requirementSets },
          state,
        },
      })
      onEvent(componentEvents.COMPANY_STATE_TAX_UPDATED)
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <FormProvider {...methods} control={control}>
      <HtmlForm onSubmit={methods.handleSubmit(onSubmit)}>
        <StateTaxesFormPresentation
          stateTaxRequirements={stateTaxRequirements}
          isPending={isPendingUpdate}
          state={state}
          handleCancel={handleCancel}
        />
      </HtmlForm>
    </FormProvider>
  )
}
