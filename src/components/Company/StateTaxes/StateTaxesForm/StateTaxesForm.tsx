import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/taxRequirementsUpdateState'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/taxRequirementsGet'
import { z } from 'zod'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Head } from './Head'
import { StateTaxesFormProvider } from './context'
import { Form } from './Form'
import { Actions } from './Actions'
import { toRhfKey } from './rhfKey'
import { isRequirementApplicable, type StateTaxesFormValues } from './applicableIf'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { Form as HtmlForm } from '@/components/Common/Form'
import { componentEvents } from '@/shared/constants'
import { useBase } from '@/components/Base'

interface StateTaxesFormProps extends CommonComponentInterface {
  companyId: string
  state: string
}

function stringifyRequirementValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') return isNaN(value) ? '' : String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return String(value)
  return ''
}

/**
 * Standalone form for editing a company's state tax requirements for a single state.
 *
 * @remarks
 * Lower-level building block used by {@link StateTaxes} for its edit view. Use directly when
 * you need full control over navigation between the list and edit views.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/stateTaxes/updated` | State tax requirements were saved successfully | Response from the update state tax requirements API |
 * | `CANCEL` | The user cancelled editing | — |
 *
 * @param props - {@link StateTaxesFormProps}
 * @returns The rendered state taxes edit form.
 * @public
 *
 * @example
 * ```tsx
 * import { CompanyOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyOnboarding.StateTaxesForm
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       state="CA"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function StateTaxesForm(props: StateTaxesFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, state, className, children }: StateTaxesFormProps) {
  useI18n('Company.StateTaxes')
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { data } = useTaxRequirementsGetSuspense({ companyUuid: companyId, state })
  const stateTaxRequirements = data.taxRequirementsState!

  const { mutateAsync: updateStateTax, isPending: isPendingUpdate } =
    useTaxRequirementsUpdateStateMutation()

  // Schema and default value generation
  const { dynamicSchema, defaultValues } = useMemo(() => {
    const schemaShape: Record<string, z.ZodObject> = {}
    const values: Partial<Record<string, Record<string, string | boolean | number | undefined>>> =
      {}

    //Looping through each requirement set
    stateTaxRequirements.requirementSets?.forEach(requirementSet => {
      if (!requirementSet.key) return

      const requirementSetKey = requirementSet.key
      const requirementShape: Record<string, z.ZodType> = {}
      const requirementValues: Record<string, string | boolean | number | undefined> = {}

      requirementSet.requirements?.forEach(requirement => {
        if (!requirement.key) return

        const requirementKey = toRhfKey(requirement.key)

        const isPercentField =
          requirement.metadata?.type === 'tax_rate' || requirement.metadata?.type === 'percent'

        if (requirement.metadata?.type === 'radio') {
          requirementValues[requirementKey] = requirement.value ?? undefined
        } else if (requirement.metadata?.type === 'workers_compensation_rate') {
          requirementValues[requirementKey] =
            requirement.value !== null && requirement.value !== undefined
              ? Number(requirement.value)
              : undefined
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
        } else if (requirement.metadata?.type === 'workers_compensation_rate') {
          fieldSchema = z.number().optional()
        }
        requirementShape[requirementKey] = fieldSchema
        // --- End Schema Logic ---
      })

      if (Object.keys(requirementShape).length > 0) {
        schemaShape[requirementSetKey] = z.object(requirementShape)
        values[requirementSetKey] = requirementValues
      }
    })

    const finalSchema = z.object(schemaShape)

    // Return both the schema and the default values
    return {
      dynamicSchema: finalSchema,
      defaultValues: values as z.infer<typeof finalSchema>,
    }
  }, [stateTaxRequirements, t])

  // Infer the type from the schema
  type InferredFormInputs = z.infer<typeof dynamicSchema>

  const { control, ...methods } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
  })

  const onSubmit = async (formData: InferredFormInputs) => {
    await baseSubmitHandler(formData, async payload => {
      const formValues = payload as StateTaxesFormValues
      const requirementSets = stateTaxRequirements.requirementSets
        ?.filter(rs => rs.key && payload[rs.key])
        .map(requirementSet => {
          const requirementSetKey = requirementSet.key as string
          const payloadSet = payload[requirementSetKey] as Record<string, unknown>

          const applicableRequirements = (requirementSet.requirements ?? []).filter(req =>
            isRequirementApplicable(req, requirementSetKey, formValues),
          )

          return {
            state,
            key: requirementSetKey,
            effectiveFrom: requirementSet.effectiveFrom,
            requirements: applicableRequirements.map(req => ({
              key: req.key as string,
              value: stringifyRequirementValue(payloadSet[toRhfKey(req.key as string)]),
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
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <HtmlForm onSubmit={methods.handleSubmit(onSubmit)}>
          <StateTaxesFormProvider
            value={{ stateTaxRequirements, isPending: isPendingUpdate, state, handleCancel }}
          >
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                  <Actions />
                </>
              )}
            </Flex>
          </StateTaxesFormProvider>
        </HtmlForm>
      </FormProvider>
    </section>
  )
}
