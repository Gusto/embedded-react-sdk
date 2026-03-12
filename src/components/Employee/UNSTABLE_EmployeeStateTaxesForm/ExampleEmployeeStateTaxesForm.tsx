import { Fragment } from 'react/jsx-runtime'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DOMPurify from 'dompurify'
import {
  useEmployeeStateTaxes,
  type EmployeeStateTaxesReady,
  type StateTaxFieldMetadata,
} from './useEmployeeStateTaxes'
import { SelectField } from '@/components/Common/Fields/SelectField/SelectField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField/NumberInputField'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField/RadioGroupField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField/DatePickerField'
import { Form } from '@/components/Common/Form'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  BaseLayout,
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'

const DOMPURIFY_CONFIG = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['target', 'href'] }

interface ExampleEmployeeStateTaxesFormProps extends CommonComponentInterface {
  employeeId: string
  isAdmin?: boolean
}

export function ExampleEmployeeStateTaxesForm({
  onEvent,
  FallbackComponent,
  ...props
}: ExampleEmployeeStateTaxesFormProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      onErrorBoundaryError={error => {
        onEvent(componentEvents.ERROR, error)
      }}
    >
      <Root {...props} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function Root({
  employeeId,
  isAdmin,
  onEvent,
}: ExampleEmployeeStateTaxesFormProps & { onEvent: OnEventType<EventType, unknown> }) {
  const stateTaxes = useEmployeeStateTaxes({ employeeId, isAdmin })

  if (stateTaxes.isLoading) {
    return <BaseLayout isLoading error={null} fieldErrors={null} />
  }

  return <StateTaxesForm stateTaxes={stateTaxes} onEvent={onEvent} />
}

interface StateTaxesFormProps {
  stateTaxes: EmployeeStateTaxesReady
  onEvent: OnEventType<EventType, unknown>
}

function StateTaxesForm({ stateTaxes, onEvent }: StateTaxesFormProps) {
  const Components = useComponentContext()

  type StateTaxFormData = Parameters<typeof stateTaxes.onSubmit>[0]

  const formMethods = useForm<Record<string, unknown>, unknown, StateTaxFormData>({
    // @ts-expect-error: Dynamic Zod schema produces a narrower output type than useForm infers from defaultValues
    resolver: zodResolver(stateTaxes.schema),
    defaultValues: stateTaxes.defaultValues,
  })

  const handleSubmit = async (data: StateTaxFormData) => {
    const result = await stateTaxes.onSubmit(data)
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, result)
    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
  }

  return (
    <BaseLayout
      error={stateTaxes.errors.error}
      fieldErrors={
        stateTaxes.errors.fieldErrors && stateTaxes.errors.fieldErrors.length > 0
          ? stateTaxes.errors.fieldErrors
          : null
      }
    >
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Flex flexDirection="column" gap={32}>
            {stateTaxes.states.map(stateResult => (
              <Fragment key={stateResult.state}>
                <header>
                  <Components.Heading as="h2">{stateResult.state} State Taxes</Components.Heading>
                </header>

                {Object.values(stateResult.fields).map(field => (
                  <StateTaxField
                    key={field.questionKey}
                    field={field}
                    fieldPrefix={`states.${stateResult.state}`}
                  />
                ))}
              </Fragment>
            ))}

            <ActionsLayout>
              <Components.Button type="submit" isLoading={stateTaxes.isPending}>
                Save
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </BaseLayout>
  )
}

interface StateTaxFieldProps {
  field: StateTaxFieldMetadata
  fieldPrefix: string
}

function StateTaxField({ field, fieldPrefix }: StateTaxFieldProps) {
  const fieldName = `${fieldPrefix}.${field.name}`

  if (field.isDisabled) return null

  const sanitizedDescription = field.description
    ? DOMPurify.sanitize(field.description, DOMPURIFY_CONFIG)
    : undefined

  switch (field.type) {
    case 'enum': {
      const options = field.options ?? []

      if (field.questionKey === 'file_new_hire_report') {
        return (
          <RadioGroupField
            name={fieldName}
            label={field.label}
            isRequired={field.isRequired}
            isDisabled={field.isDisabled}
            description={
              sanitizedDescription ? (
                <span dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
              ) : undefined
            }
            options={options.map(o => ({ value: o.value, label: o.label }))}
          />
        )
      }

      return (
        <SelectField
          name={fieldName}
          label={field.label}
          isRequired={field.isRequired}
          isDisabled={field.isDisabled}
          description={sanitizedDescription}
          options={options.map(o => ({ value: o.value, label: o.label }))}
        />
      )
    }
    case 'number':
      return (
        <NumberInputField
          name={fieldName}
          label={field.label}
          isRequired={field.isRequired}
          isDisabled={field.isDisabled}
          description={sanitizedDescription}
          format="decimal"
        />
      )
    case 'boolean':
      return (
        <RadioGroupField
          name={fieldName}
          label={field.label}
          isRequired={field.isRequired}
          isDisabled={field.isDisabled}
          description={
            sanitizedDescription ? (
              <span dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            ) : undefined
          }
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
      )
    case 'date':
      return (
        <DatePickerField
          name={fieldName}
          label={field.label}
          isRequired={field.isRequired}
          isDisabled={field.isDisabled}
          description={sanitizedDescription}
        />
      )
    case 'text':
    default:
      return (
        <TextInputField
          name={fieldName}
          label={field.label}
          isRequired={field.isRequired}
          isDisabled={field.isDisabled}
          description={sanitizedDescription}
        />
      )
  }
}
