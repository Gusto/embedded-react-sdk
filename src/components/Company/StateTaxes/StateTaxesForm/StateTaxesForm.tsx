import { Form as AriaForm } from 'react-aria-components'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import * as v from 'valibot'
import { useMemo } from 'react'
import type { InferInput } from 'valibot'
import { useTranslation } from 'react-i18next'
import { Head } from './Head'
import { StateTaxesFormProvider } from './context'
import { Form } from './Form'
import { Actions } from './Actions'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
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
    const schemaShape: Record<
      string,
      v.ObjectSchema<
        Record<string, v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>,
        undefined
      >
    > = {}
    const values: Partial<Record<string, Record<string, string>>> = {}

    //Looping through each requirement set
    stateTaxRequirements.requirementSets?.forEach(requirementSet => {
      if (!requirementSet.key) return

      const requirementSetKey = requirementSet.key
      // Explicitly type requirementShape to allow string indexing
      const requirementShape: Record<
        string,
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
      > = {}
      const requirementValues: Record<string, string> = {}

      requirementSet.requirements?.forEach(requirement => {
        if (!requirement.key) return

        const requirementKey = requirement.key

        // --- Default Value Logic ---
        requirementValues[requirementKey] = String(requirement.value ?? '')

        // --- Schema Logic ---
        // Explicitly type fieldSchema with a broad BaseSchema type to handle subsequent pipes
        // Since we don't know the type of the requirement.value, we use unknown()
        let fieldSchema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> = v.pipe(
          v.unknown(),
          v.transform(input => String(input)),
          v.nonEmpty(),
        )

        const validation = requirement.metadata?.validation
        // Not all requirements have validation
        if (validation) {
          if (requirement.metadata?.type === 'tax_rate') {
            if (validation.type === 'min_max') {
              const min = parseFloat(validation.min as string)
              const max = parseFloat(validation.max as string)

              if (!isNaN(min) && !isNaN(max)) {
                // Pipe directly onto the current fieldSchema
                fieldSchema = v.pipe(
                  fieldSchema,
                  v.transform(input => {
                    return Number(input)
                  }),
                  // Apply numeric validations after successful transform
                  v.minValue(min, t('validations.minValue', { min })),
                  v.maxValue(max, t('validations.maxValue', { max })),
                  v.transform(num => String(num)),
                )
              }
            } else {
              //Type is one_of
              const oneOfValues = validation.rates as string[]
              fieldSchema = v.pipe(
                fieldSchema,
                v.transform(input => String(input)),
                v.picklist(oneOfValues, t('validations.oneOf', { values: oneOfValues.join(', ') })),
              )
            }
          }
        }
        requirementShape[requirementKey] = fieldSchema
        // --- End Schema Logic ---
      })

      if (Object.keys(requirementShape).length > 0) {
        // Assign the correctly typed object schema
        schemaShape[requirementSetKey] = v.object(requirementShape)
        values[requirementSetKey] = requirementValues
      }
    })

    const finalSchema = v.object(schemaShape, undefined)

    // Return both the schema and the correctly typed default values
    return {
      dynamicSchema: finalSchema,
      // Cast defaultValues based on the final inferred schema type
      defaultValues: values as InferInput<typeof finalSchema>,
    }
  }, [stateTaxRequirements, t])

  // Infer the type from the schema returned by useMemo
  type InferredFormInputs = InferInput<typeof dynamicSchema>

  const { control, ...methods } = useForm<InferredFormInputs>({
    resolver: valibotResolver(dynamicSchema),
    defaultValues,
  })

  const onSubmit = async (formData: InferredFormInputs) => {
    await baseSubmitHandler(formData, async payload => {
      const requirementSets = stateTaxRequirements.requirementSets
        ?.filter(rs => rs.key && payload[rs.key]) // Type assertion for payload key
        .map(requirementSet => {
          const requirementSetKey = requirementSet.key as string
          // Type assertion for payload access
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
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
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
        </AriaForm>
      </FormProvider>
    </section>
  )
}

StateTaxesForm.Head = Head
StateTaxesForm.Form = Form
StateTaxesForm.Actions = Actions
