import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTaxRequirementsUpdateStateMutation } from '@gusto/embedded-api/react-query/taxRequirementsUpdateState'
import { useTaxRequirementsGetSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGet'
import { z } from 'zod'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getUniqueRhfKey } from '../shared/rhfKey'
import { isRequirementApplicable, type StateTaxesFormValues } from '../shared/applicableIf'
import { buildRequirementSchema } from '../shared/buildRequirementSchema'
import { stringifyRequirementValue } from '../shared/requirementValue'
import { Head } from './Head'
import { StateTaxesFormProvider } from './context'
import { Form } from './Form'
import { Actions } from './Actions'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { Form as HtmlForm } from '@/components/Common/Form'
import { componentEvents } from '@/shared/constants'
import { useBase } from '@/components/Base'

/**
 * Props for {@link StateTaxesForm}.
 *
 * @public
 */
export interface StateTaxesFormProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** The associated company identifier. */
  companyId: string
  /** Two-letter code of the state whose tax requirements are edited. */
  state: string
}

/**
 * Standalone form for editing a company's state tax requirements for a single state.
 *
 * @remarks
 * Lower-level building block used by {@link StateTaxes} for its edit view. Use directly when
 * you need full control over navigation between the list and edit views.
 *
 * @events
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
export function StateTaxesForm(props: StateTaxesFormProps) {
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
    const requirementSets = stateTaxRequirements.requirementSets ?? []

    //Looping through each requirement set. A single key (e.g. "taxrates") can appear more than
    //once when a future-dated set is already scheduled alongside the current one, so each set
    //needs its own disambiguated path — otherwise two visually distinct sections would silently
    //share one underlying form field.
    requirementSets.forEach((requirementSet, index) => {
      if (!requirementSet.key) return

      const requirementSetPath = getUniqueRhfKey(requirementSet, index, requirementSets)
      const { shape, defaults } = buildRequirementSchema(requirementSet.requirements, t)

      if (Object.keys(shape).length > 0) {
        schemaShape[requirementSetPath] = z.object(shape)
        values[requirementSetPath] = defaults
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
      const allRequirementSets = stateTaxRequirements.requirementSets ?? []
      const requirementSets = allRequirementSets
        .map((requirementSet, setIndex) => ({ requirementSet, setIndex }))
        .filter(({ requirementSet, setIndex }) => {
          if (!requirementSet.key) return false
          const requirementSetPath = getUniqueRhfKey(requirementSet, setIndex, allRequirementSets)
          return Boolean(payload[requirementSetPath])
        })
        .map(({ requirementSet, setIndex }) => {
          const requirementSetKey = requirementSet.key as string
          const requirementSetPath = getUniqueRhfKey(requirementSet, setIndex, allRequirementSets)
          const payloadSet = payload[requirementSetPath] as Record<string, unknown>
          const requirements = requirementSet.requirements ?? []

          const applicableRequirements = requirements
            .map((req, index) => ({ req, index }))
            .filter(({ req }) => req.editable !== false)
            .filter(({ req }) => isRequirementApplicable(req, requirementSetPath, formValues))

          return {
            state,
            key: requirementSetKey,
            effectiveFrom: requirementSet.effectiveFrom,
            requirements: applicableRequirements.map(({ req, index }) => ({
              key: req.key as string,
              value: stringifyRequirementValue(
                payloadSet[getUniqueRhfKey(req, index, requirements)],
              ),
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
