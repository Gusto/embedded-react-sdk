import { parseDate } from '@internationalized/date'
import DOMPurify from 'dompurify'
import {
  Label,
  ListBoxItem,
  DateSegment,
  DateInput as _DateInput,
  DateField as _DateField,
  Text,
} from 'react-aria-components'
import { useController, type Control } from 'react-hook-form'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { type TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { Select, RadioGroup, TextInputField, NumberField } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['target', 'href'] }

interface EmpQ {
  question: NonNullable<EmployeeStateTaxQuestion>
  requirement?: never
  control: Control
}
interface CompR {
  requirement: TaxRequirement
  question?: never
  control: Control
}

type NumberFieldProps = { isCurrency?: boolean }

export function SelectInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  const meta = question ? question.inputQuestionFormat : requirement.metadata
  if (!meta?.options) throw new Error('Select input must have options')
  return (
    <Select
      control={control}
      name={key as string}
      // @ts-expect-error HACK value is insufficiently narrowed here
      defaultSelectedKey={value}
      label={label}
      description={description}
      items={meta.options.map((item, _) => ({
        id: item.value,
        name: item.label,
      }))}
    >
      {option => <ListBoxItem>{option.name}</ListBoxItem>}
    </Select>
  )
}

export function TextInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  return (
    <TextInputField
      name={key as string}
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
  control,
}: (EmpQ | CompR) & NumberFieldProps) {
  const { currency } = useLocale()
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  return (
    <NumberField
      control={control}
      name={key as string}
      label={label}
      description={description}
      defaultValue={Number(value)}
      formatOptions={{
        style: isCurrency ? 'currency' : 'decimal',
        currency: currency,
        currencyDisplay: 'symbol',
      }}
    />
  )
}

export function RadioInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  const meta = question ? question.inputQuestionFormat : requirement.metadata
  if (!meta?.options) throw new Error(`RadioInput must have options:${JSON.stringify(question)}`)
  return (
    <RadioGroup
      name={key as string}
      control={control}
      //File new hire report setting cannot be changed after it has been configured.
      isDisabled={
        key?.includes('file_new_hire_report') ? (value === undefined ? false : true) : false
      }
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
        value: item.value as string,
        label: item.label,
      }))}
    />
  )
}
//TODO: This type is untested as of yet
export function DateField({ question, requirement, control }: (EmpQ | CompR) & NumberFieldProps) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  if (typeof value !== 'string') throw new Error('Expecting value to be string for DateInput')
  const { field } = useController({ name: key as string, control: control, defaultValue: value })
  return (
    <_DateField {...field} value={parseDate(value)}>
      <Label>{label}</Label>
      <_DateInput>{segment => <DateSegment segment={segment} />}</_DateInput>
      {description && (
        <Text
          slot="description"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
        />
      )}
    </_DateField>
  )
}
