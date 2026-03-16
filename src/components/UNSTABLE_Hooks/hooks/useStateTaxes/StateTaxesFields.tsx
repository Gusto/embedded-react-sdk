/* eslint-disable react-refresh/only-export-components */
import type { ReactNode, ComponentType } from 'react'
import DOMPurify from 'dompurify'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { SelectField } from '@/components/Common/Fields/SelectField/SelectField'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField/NumberInputField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField/RadioGroupField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField/DatePickerField'
import { PercentageField } from '@/components/Common/Fields/PercentageField/PercentageField'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

const DOMPURIFY_CONFIG = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['target', 'href'] }

export interface StateTaxFieldProps {
  label?: ReactNode
  description?: ReactNode
  isDisabled?: boolean
}

export type StateTaxesFieldComponents = Record<
  string,
  Record<string, ComponentType<StateTaxFieldProps>>
>

function snakeToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

export function createStateTaxField(
  state: string,
  question: EmployeeStateTaxQuestion,
): ComponentType<StateTaxFieldProps> {
  const fieldName = `states.${state}.${snakeCaseToCamelCase(question.key)}`
  const isFileNewHireReport = question.key === 'file_new_hire_report'
  const resolvedType = isFileNewHireReport
    ? 'radio'
    : question.inputQuestionFormat.type.toLowerCase()
  const currentValue = question.answers[0]?.value
  const fileNewHireReportIsLocked = isFileNewHireReport && currentValue !== undefined

  function StateTaxField({ label, description, isDisabled }: StateTaxFieldProps) {
    const resolvedLabel = (label ?? question.label) as string
    const resolvedDescription = description ?? question.description
    const resolvedDisabled = isDisabled ?? fileNewHireReportIsLocked

    switch (resolvedType) {
      case 'select':
        return (
          <StateTaxSelectField
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            isDisabled={resolvedDisabled}
            options={question.inputQuestionFormat.options}
          />
        )

      case 'radio':
        return (
          <StateTaxRadioField
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            isDisabled={resolvedDisabled}
            options={question.inputQuestionFormat.options}
          />
        )

      case 'number':
        return (
          <NumberInputField
            isRequired
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            format="decimal"
            isDisabled={resolvedDisabled}
          />
        )

      case 'currency':
        return (
          <NumberInputField
            isRequired
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            format="currency"
            isDisabled={resolvedDisabled}
          />
        )

      case 'percent':
      case 'tax_rate':
        return (
          <PercentageField
            isRequired
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            decimalValue={currentValue}
            isDisabled={resolvedDisabled}
          />
        )

      case 'date':
        return (
          <DatePickerField
            isRequired
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            isDisabled={resolvedDisabled}
          />
        )

      case 'text':
      case 'account_number':
      default:
        return (
          <TextInputField
            isRequired
            name={fieldName}
            label={resolvedLabel}
            description={resolvedDescription}
            isDisabled={resolvedDisabled}
          />
        )
    }
  }

  StateTaxField.displayName = `StateTaxField(${state}.${snakeToPascalCase(question.key)})`

  return StateTaxField
}

interface StateTaxSelectFieldProps {
  name: string
  label: string
  description: ReactNode
  isDisabled: boolean
  options: EmployeeStateTaxQuestion['inputQuestionFormat']['options']
}

function StateTaxSelectField({
  name,
  label,
  description,
  isDisabled,
  options,
}: StateTaxSelectFieldProps) {
  if (!options) throw new Error('Select input must have options')

  return (
    <SelectField
      isRequired
      name={name}
      label={label}
      description={description}
      isDisabled={isDisabled}
      options={options.map(item => ({
        value: item.value,
        label: item.label,
      }))}
    />
  )
}

interface StateTaxRadioFieldProps {
  name: string
  label: string
  description: ReactNode
  isDisabled: boolean
  options: EmployeeStateTaxQuestion['inputQuestionFormat']['options']
}

function StateTaxRadioField({
  name,
  label,
  description,
  isDisabled,
  options,
}: StateTaxRadioFieldProps) {
  const { Text } = useComponentContext()

  if (!options) throw new Error('RadioInput must have options')

  const sanitizedDescription =
    typeof description === 'string' ? (
      <Text as="span">
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description, DOMPURIFY_CONFIG),
          }}
        />
      </Text>
    ) : (
      description
    )

  return (
    <RadioGroupField
      isRequired
      name={name}
      label={label}
      description={sanitizedDescription}
      isDisabled={isDisabled}
      options={options.map(item => ({
        value: item.value,
        label: item.label,
      }))}
    />
  )
}
