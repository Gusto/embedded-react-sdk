import DOMPurify from 'dompurify'
import { Text } from 'react-aria-components'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { type TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { useTranslation } from 'react-i18next'
import { SelectField } from '../Fields/SelectField/SelectField'
import { TextInputField } from '../Fields/TextInputField/TextInputField'
import { NumberInputField } from '../Fields/NumberInputField/NumberInputField'
import { RadioGroupField } from '../Fields/RadioGroupField/RadioGroupField'
import { DatePickerField } from '../Fields/DatePickerField/DatePickerField'
import { useMaskedTransform } from '@/helpers/mask'

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['target', 'href'] }

interface EmpQ {
  question: NonNullable<EmployeeStateTaxQuestion>
  requirement?: never
  isDisabled?: boolean
}
interface CompR {
  requirement: TaxRequirement
  question?: never
  isDisabled?: boolean
}

type NumberFieldProps = { isCurrency?: boolean; isPercent?: boolean }

export function QuestionInput({
  questionType,
  ...props
}: (EmpQ | CompR) & {
  questionType: string
}) {
  switch (questionType.toLowerCase()) {
    case 'date':
      return <DateField {...props} />
    case 'radio':
      return <RadioInput {...props} />
    case 'text':
    case 'account_number': //TODO: temporary - need special handling for account numbers
      return <TextInput {...props} />
    case 'select':
      return <SelectInput {...props} />
    case 'number':
      return <NumberInput {...props} />
    case 'workers_compensation_rate':
      return (
        <NumberInput {...props} isPercent={props.requirement?.metadata?.rateType === 'percent'} />
      )
    case 'percent':
    case 'tax_rate':
      return <NumberInput {...props} isPercent />
    case 'currency':
      return <NumberInput {...props} isCurrency />
    default:
      return <TextInput {...props} />
    // return null
  }
}

export function SelectInput({ question, requirement, isDisabled = false }: EmpQ | CompR) {
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
      isDisabled={
        key.includes('fileNewHireReport') ? (value === undefined ? false : true) : isDisabled
      }
      options={meta.options.map((item, _) => ({
        value: item.value,
        label: item.label,
      }))}
    />
  )
}

export function TextInput({ question, requirement, isDisabled = false }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value
  const mask = requirement?.metadata?.mask ?? null
  const transform = useMaskedTransform(mask)

  if (!key) return null
  return (
    <TextInputField
      name={key}
      label={label}
      // @ts-expect-error HACK value is insufficiently narrowed here
      defaultValue={value}
      description={description}
      isDisabled={isDisabled}
      transform={mask ? transform : undefined}
      placeholder={mask ? mask : undefined}
    />
  )
}
export function NumberInput({
  question,
  requirement,
  isCurrency,
  isPercent,
  isDisabled = false,
}: (EmpQ | CompR) & NumberFieldProps) {
  const { t } = useTranslation('common')
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  if (!key) return null

  const wcDescription =
    requirement?.metadata?.type === 'workers_compensation_rate' &&
    requirement.metadata.riskClassCode !== undefined
      ? `${requirement.metadata.riskClassCode}: ${requirement.metadata.riskClassDescription}`
      : null
  const adornmentEnd =
    requirement?.metadata?.rateType === 'currency_per_hour'
      ? t('inputs.workersCompensationRatePerHourAdornment')
      : undefined

  return (
    <NumberInputField
      name={key}
      label={label}
      description={description ?? wcDescription}
      defaultValue={Number(value)}
      format={isCurrency ? 'currency' : isPercent ? 'percent' : 'decimal'}
      isDisabled={isDisabled}
      maximumFractionDigits={isPercent ? 4 : undefined}
      adornmentEnd={adornmentEnd}
    />
  )
}

export function RadioInput({ question, requirement, isDisabled = false }: EmpQ | CompR) {
  const { key, label, description } = question ? question : requirement
  const value = question ? question.answers[0]?.value : requirement.value

  const meta = question ? question.inputQuestionFormat : requirement.metadata
  if (!meta?.options) throw new Error(`RadioInput must have options:${JSON.stringify(question)}`)

  if (!key) return null

  return (
    <RadioGroupField
      name={key}
      //File new hire report setting cannot be changed after it has been configured.
      isDisabled={
        key.includes('fileNewHireReport') ? (value === undefined ? false : true) : isDisabled
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
        value: item.value,
        label: item.label,
      }))}
    />
  )
}
//TODO: This type is untested as of yet
export function DateField({
  question,
  requirement,
  isDisabled = false,
}: (EmpQ | CompR) & NumberFieldProps) {
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
      isDisabled={isDisabled}
    />
  )
}
