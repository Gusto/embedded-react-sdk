import DOMPurify from 'dompurify'
import { Text } from 'react-aria-components'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { type TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { SelectField } from '../Fields/SelectField/SelectField'
import { TextInputField } from '../Fields/TextInputField/TextInputField'
import { NumberInputField } from '../Fields/NumberInputField/NumberInputField'
import { RadioGroupField } from '../Fields/RadioGroupField/RadioGroupField'
import { DatePickerField } from '../Fields/DatePickerField/DatePickerField'

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['target', 'href'] }

interface EmpQ {
  question: NonNullable<EmployeeStateTaxQuestion>
  requirement?: never
}
interface CompR {
  requirement: TaxRequirement
  question?: never
}

type NumberFieldProps = { isCurrency?: boolean }

export function SelectInput({ question, requirement }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  const meta = question ? question.inputQuestionFormat : requirement.metadata
  if (!meta?.options) throw new Error('Select input must have options')

  if (!key) return null

  return (
    <SelectField
      name={key}
      defaultValue={value}
      label={label as string}
      description={description}
      isDisabled={key.includes('fileNewHireReport') ? (value === undefined ? false : true) : false}
      options={meta.options.map((item, _) => ({
        value: item.value,
        label: item.label,
      }))}
    />
  )
}

export function TextInput({ question, requirement }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  if (!key) return null

  return (
    <TextInputField
      name={key}
      label={label}
      // @ts-expect-error HACK value is insufficiently narrowed here
      defaultValue={value}
      description={description}
    />
  )
}
export function NumberInput({
  question,
  requirement,
  isCurrency,
}: (EmpQ | CompR) & NumberFieldProps) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  if (!key) return null

  return (
    <NumberInputField
      name={key}
      label={label}
      description={description}
      defaultValue={Number(value)}
      format={isCurrency ? 'currency' : 'decimal'}
      currencyDisplay="symbol"
    />
  )
}

export function RadioInput({ question, requirement }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  const meta = question ? question.inputQuestionFormat : requirement.metadata
  if (!meta?.options) throw new Error(`RadioInput must have options:${JSON.stringify(question)}`)

  if (!key) return null

  return (
    <RadioGroupField
      name={key}
      //File new hire report setting cannot be changed after it has been configured.
      isDisabled={key.includes('fileNewHireReport') ? (value === undefined ? false : true) : false}
      description={
        description && (
          <Text
            slot="description"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
          />
        )
      }
      label={label as string}
      options={meta.options.map(item => ({
        value: item.value,
        label: item.label,
      }))}
    />
  )
}
//TODO: This type is untested as of yet
export function DateField({ question, requirement }: (EmpQ | CompR) & NumberFieldProps) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  if (typeof value !== 'string') throw new Error('Expecting value to be string for DateInput')

  if (!key) return null

  return (
    <DatePickerField
      name={key}
      defaultValue={value ? new Date(value) : null}
      label={label as string}
      description={description}
    />
  )
}
