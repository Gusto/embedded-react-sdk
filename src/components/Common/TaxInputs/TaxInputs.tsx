import { parseDate } from '@internationalized/date'
import DOMPurify from 'dompurify'
import {
  Input,
  Label,
  ListBoxItem,
  // eslint-disable-next-line no-restricted-imports
  NumberField,
  Radio,
  // eslint-disable-next-line no-restricted-imports
  RadioGroup,
  // eslint-disable-next-line no-restricted-imports
  TextField,
  DateSegment,
  DateInput as _DateInput,
  DateField as _DateField,
  Text,
} from 'react-aria-components'
import { useController, type Control } from 'react-hook-form'
import { Select } from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'
import { Schemas } from '@/types'

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'] }

interface EmpQ {
  question: NonNullable<Schemas['Employee-State-Tax-Question']>
  requirement?: never
  control: Control
}
interface CompR {
  requirement: NonNullable<Schemas['Tax-Requirement']>
  question?: never
  control: Control
}

type NumberFieldProps = { isCurrency?: boolean }
// function getPlaceholder(metadata: Metadata) {
//   if (!metadata) return undefined;
//   if (metadata.mask) return metadata.mask;
//   if (metadata.validation?.type === 'min_max' && metadata.validation.min && metadata.validation.max)
//     return `between ${toPercent(metadata.validation.min)} and ${toPercent(metadata.validation.max)}`;
//   return undefined;
// }

export function SelectInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  const { field } = useController({ name: key as string, control: control, defaultValue: value })

  const meta = question ? question.input_question_format : requirement.metadata
  if (!meta?.options) throw new Error('Select input must have options')
  return (
    <Select
      {...field}
      defaultSelectedKey={value}
      label={label as string}
      description={
        description ? (
          <Text
            slot="description"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
          />
        ) : null
      }
      items={meta.options.map(item => ({ id: item.value, name: item.label }))}
    >
      {(option: { name: string; id: string }) => <ListBoxItem>{option.name}</ListBoxItem>}
    </Select>
  )
}

export function TextInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  const { field } = useController({ name: key as string, control: control, defaultValue: value })

  return (
    <TextField
      {...field}
      // defaultValue={requirement.value}
    >
      <Label>{label}</Label>
      {description && (
        <Text
          slot="description"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
        />
      )}
      {/* <Input placeholder={getPlaceholder(requirement.metadata)} /> */}
      <Input />
    </TextField>
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

  const { field } = useController({ name: key as string, control: control, defaultValue: value })
  return (
    <NumberField
      {...field}
      formatOptions={{
        style: isCurrency ? 'currency' : 'decimal',
        currency: currency,
        currencyDisplay: 'symbol',
      }}
    >
      <Label>{label}</Label>
      {description && (
        <Text
          slot="description"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
        />
      )}
      {/* <Input placeholder={getPlaceholder(requirement.metadata)} /> */}
      <Input />
    </NumberField>
  )
}

export function RadioInput({ question, requirement, control }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  const meta = question ? question.input_question_format : requirement.metadata
  if (!meta?.options) throw new Error('RadioInput must have options')
  const { field } = useController({ name: key as string, control: control, defaultValue: value })
  return (
    <RadioGroup {...field}>
      <Label>{label}</Label>
      {description && (
        <Text
          slot="description"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, dompurifyConfig) }}
        />
      )}
      <>
        {meta.options.map(({ label: _label, value: _value }) => (
          <Radio key={_label} value={_value as string}>
            {label}
          </Radio>
        ))}
      </>
    </RadioGroup>
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
