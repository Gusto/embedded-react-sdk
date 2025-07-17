import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import { z } from 'zod'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Head } from './Head'
import { StateTaxesFormProvider } from './context'
import { Form } from './Form'
import { Actions } from './Actions'
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
    const schemaShape: Record<string, z.ZodObject<Record<string, z.ZodTypeAny>>> = {}
    const values: Partial<Record<string, Record<string, string | boolean | number | undefined>>> =
      {}

    //Looping through each requirement set
    stateTaxRequirements.requirementSets?.forEach(requirementSet => {
      if (!requirementSet.key) return

      const requirementSetKey = requirementSet.key
      const requirementShape: Record<string, z.ZodTypeAny> = {}
      const requirementValues: Record<string, string | boolean | number | undefined> = {}

      requirementSet.requirements?.forEach(requirement => {
        if (!requirement.key) return

        const requirementKey = requirement.key

        // --- Default Value Logic ---
        requirementValues[requirementKey] =
          requirement.metadata?.type === 'radio'
            ? (requirement.value ?? undefined)
            : requirement.value
              ? String(requirement.value)
              : ''

        // --- Schema Logic ---
        // Start with a basic string schema
        let fieldSchema: z.ZodTypeAny = z
          .string({
            required_error: t('validations.required'),
          })
          .min(1, t('validations.required'))

        const validation = requirement.metadata?.validation
        // Not all requirements have validation
        if (validation) {
          if (requirement.metadata?.type === 'tax_rate') {
            if (validation.type === 'min_max') {
              const min = parseFloat(validation.min as string)
              const max = parseFloat(validation.max as string)

              if (!isNaN(min) && !isNaN(max)) {
                fieldSchema = z.preprocess(
                  val => Number(val),
                  z
                    .number()
                    .min(min, t('validations.minValue', { min }))
                    .max(max, t('validations.maxValue', { max }))
                    .transform(num => String(num)),
                )
              }
            } else {
              //Type is one_of
              const oneOfValues = validation.rates as string[]
              fieldSchema = z
                .string({
                  required_error: t('validations.required'),
                })
                .min(1, t('validations.required'))
                .refine(val => oneOfValues.includes(val), {
                  message: t('validations.oneOf', { values: oneOfValues.join(', ') }),
                })
            }
          }
        }
        if (requirement.metadata?.type === 'radio') {
          fieldSchema = z.boolean({
            required_error: t('validations.required'),
          })
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

  const { control, ...methods } = useForm<InferredFormInputs>({
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
            state: requirementSet.state,
            key: requirementSetKey,
            effectiveFrom: requirementSet.effectiveFrom,
            requirements: Object.entries(payloadSet).map(([key, value]) => ({
              key,
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

StateTaxesForm.Head = Head
StateTaxesForm.Form = Form
StateTaxesForm.Actions = Actions
