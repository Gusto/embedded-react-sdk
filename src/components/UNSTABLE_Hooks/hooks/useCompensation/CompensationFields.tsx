import type { ReactNode, ComponentType } from 'react'
import { useFormContext } from 'react-hook-form'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { useFieldMetadata } from '../../FormFieldsContext'
import type { CompensationFormData, FlsaStatusValue, PaymentUnitValue } from './schema'
import { FlsaStatus as FlsaStatusConstants, PAY_PERIODS } from '@/shared/constants'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { SelectField } from '@/components/Common/Fields/SelectField/SelectField'
import { NumberInputField } from '@/components/Common/Fields/NumberInputField/NumberInputField'
import { SwitchField } from '@/components/Common/Fields/SwitchField/SwitchField'
import { CheckboxField } from '@/components/Common/Fields/CheckboxField/CheckboxField'
import { ComboBoxField } from '@/components/Common/Fields/ComboBoxField/ComboBoxField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField/RadioGroupField'
import { WA_RISK_CLASS_CODES } from '@/models/WA_RISK_CODES'

interface FieldProps {
  label: ReactNode
  description?: ReactNode
  placeholder?: string
}

interface FieldPropsWithValidations<TValidationKeys extends string> extends FieldProps {
  validationMessages: Record<TValidationKeys, string>
}

type RequiredValidation = 'REQUIRED'
type RateValidation = 'RATE_MINIMUM' | 'RATE_EXEMPT_THRESHOLD'

function useFieldErrorMessage<TKeys extends string>(
  fieldName: keyof CompensationFormData,
  validationMessages: Record<TKeys, string>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<CompensationFormData>()
  const errorCode = errors[fieldName]?.message as TKeys | undefined
  return errorCode ? validationMessages[errorCode] : undefined
}

// --- JobTitle ---

export type JobTitleFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function JobTitle({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: JobTitleFieldProps) {
  const errorMessage = useFieldErrorMessage('jobTitle', validationMessages)

  return (
    <TextInputField
      name="jobTitle"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

// --- FlsaStatus ---

const FLSA_STATUS_VALUES = [
  FlsaStatusConstants.EXEMPT,
  FlsaStatusConstants.SALARIED_NONEXEMPT,
  FlsaStatusConstants.NONEXEMPT,
  FlsaStatusConstants.OWNER,
  FlsaStatusConstants.COMMISSION_ONLY_EXEMPT,
  FlsaStatusConstants.COMMISSION_ONLY_NONEXEMPT,
] as const

const defaultGetFlsaStatusOptionLabel = (value: FlsaStatusValue) => value

export type FlsaStatusFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (value: FlsaStatusValue) => string
  isDisabled?: boolean
  onChange?: (value: string | number) => void
  FieldComponent?: ComponentType<SelectProps>
}

export function FlsaStatus({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel = defaultGetFlsaStatusOptionLabel,
  isDisabled: isDisabledProp,
  onChange,
  FieldComponent,
}: FlsaStatusFieldProps) {
  const { isDisabled: isDisabledMeta } = useFieldMetadata<CompensationFormData>('flsaStatus')
  const errorMessage = useFieldErrorMessage('flsaStatus', validationMessages)

  return (
    <SelectField
      name="flsaStatus"
      isRequired
      label={typeof label === 'string' ? label : ''}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      options={FLSA_STATUS_VALUES.map(value => ({
        label: getOptionLabel(value),
        value,
      }))}
      isDisabled={isDisabledProp || isDisabledMeta}
      onChange={onChange}
      FieldComponent={FieldComponent}
    />
  )
}

// --- Rate ---

export type RateFieldProps = FieldPropsWithValidations<RateValidation> & {
  isDisabled?: boolean
}

export function Rate({
  label,
  description,
  validationMessages,
  isDisabled: isDisabledProp,
}: RateFieldProps) {
  const { isDisabled: isDisabledMeta } = useFieldMetadata<CompensationFormData>('rate')
  const errorMessage = useFieldErrorMessage('rate', validationMessages)

  return (
    <NumberInputField
      name="rate"
      isRequired
      label={label}
      description={description}
      format="currency"
      min={0}
      errorMessage={errorMessage}
      isDisabled={isDisabledProp || isDisabledMeta}
    />
  )
}

// --- PaymentUnit ---

const PAYMENT_UNIT_VALUES = [
  PAY_PERIODS.HOUR,
  PAY_PERIODS.WEEK,
  PAY_PERIODS.MONTH,
  PAY_PERIODS.YEAR,
  PAY_PERIODS.PAYCHECK,
] as const

const defaultGetPaymentUnitOptionLabel = (value: PaymentUnitValue) => value

export type PaymentUnitFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (value: PaymentUnitValue) => string
  isDisabled?: boolean
  FieldComponent?: ComponentType<SelectProps>
}

export function PaymentUnit({
  label,
  description,
  validationMessages,
  getOptionLabel = defaultGetPaymentUnitOptionLabel,
  isDisabled: isDisabledProp,
  FieldComponent,
}: PaymentUnitFieldProps) {
  const { isDisabled: isDisabledMeta } = useFieldMetadata<CompensationFormData>('paymentUnit')
  const errorMessage = useFieldErrorMessage('paymentUnit', validationMessages)

  return (
    <SelectField
      name="paymentUnit"
      isRequired
      label={typeof label === 'string' ? label : ''}
      description={description}
      errorMessage={errorMessage}
      options={PAYMENT_UNIT_VALUES.map(value => ({
        label: getOptionLabel(value),
        value,
      }))}
      isDisabled={isDisabledProp || isDisabledMeta}
      FieldComponent={FieldComponent}
    />
  )
}

// --- AdjustForMinimumWage ---

export type AdjustForMinimumWageFieldProps = FieldProps

export function AdjustForMinimumWage({ label, description }: AdjustForMinimumWageFieldProps) {
  return (
    <SwitchField
      name="adjustForMinimumWage"
      label={typeof label === 'string' ? label : ''}
      description={description}
    />
  )
}

// --- MinimumWageId ---

export type MinimumWageIdFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (wage: MinimumWage) => string
  FieldComponent?: ComponentType<SelectProps>
}

export function MinimumWageId({
  label,
  description,
  validationMessages,
  getOptionLabel,
  FieldComponent,
}: MinimumWageIdFieldProps) {
  const {
    options = [],
    entries = [],
    isDisabled,
  } = useFieldMetadata<CompensationFormData, MinimumWage>('minimumWageId')
  const errorMessage = useFieldErrorMessage('minimumWageId', validationMessages)

  const resolvedOptions = getOptionLabel
    ? entries.map(wage => ({ label: getOptionLabel(wage), value: wage.uuid }))
    : options

  return (
    <SelectField
      name="minimumWageId"
      label={typeof label === 'string' ? label : ''}
      description={description}
      errorMessage={errorMessage}
      options={resolvedOptions}
      isDisabled={isDisabled}
      FieldComponent={FieldComponent}
    />
  )
}

// --- TwoPercentShareholder ---

export type TwoPercentShareholderFieldProps = FieldProps & {
  FieldComponent?: ComponentType<CheckboxProps>
}

export function TwoPercentShareholder({
  label,
  description,
  FieldComponent,
}: TwoPercentShareholderFieldProps) {
  return (
    <CheckboxField
      name="twoPercentShareholder"
      label={typeof label === 'string' ? label : ''}
      description={description}
      FieldComponent={FieldComponent}
    />
  )
}

// --- StateWcCovered ---

const STATE_WC_COVERED_VALUES = [true, false] as const

const defaultGetWcCoveredOptionLabel = (value: boolean) =>
  value ? 'Yes, this employee is covered' : 'No, this employee is not covered'

export type StateWcCoveredFieldProps = FieldProps & {
  getOptionLabel?: (value: boolean) => string
}

export function StateWcCovered({
  label,
  description,
  getOptionLabel = defaultGetWcCoveredOptionLabel,
}: StateWcCoveredFieldProps) {
  return (
    <RadioGroupField
      name="stateWcCovered"
      label={typeof label === 'string' ? label : ''}
      description={description}
      options={STATE_WC_COVERED_VALUES.map(value => ({
        label: getOptionLabel(value),
        value,
      }))}
    />
  )
}

// --- StateWcClassCode ---

export type WaRiskClassCode = (typeof WA_RISK_CLASS_CODES)[number]

const defaultGetRiskClassOptionLabel = (entry: WaRiskClassCode) =>
  `${entry.code}: ${entry.description}`

export type StateWcClassCodeFieldProps = FieldPropsWithValidations<RequiredValidation> & {
  getOptionLabel?: (entry: WaRiskClassCode) => string
}

export function StateWcClassCode({
  label,
  description,
  placeholder,
  validationMessages,
  getOptionLabel = defaultGetRiskClassOptionLabel,
}: StateWcClassCodeFieldProps) {
  const errorMessage = useFieldErrorMessage('stateWcClassCode', validationMessages)

  return (
    <ComboBoxField
      name="stateWcClassCode"
      label={typeof label === 'string' ? label : ''}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      options={WA_RISK_CLASS_CODES.map(entry => ({
        label: getOptionLabel(entry),
        value: entry.code,
      }))}
    />
  )
}

export interface CompensationFieldComponents {
  JobTitle: typeof JobTitle
  FlsaStatus: typeof FlsaStatus | undefined
  Rate: typeof Rate
  PaymentUnit: typeof PaymentUnit
  AdjustForMinimumWage: typeof AdjustForMinimumWage | undefined
  MinimumWageId: typeof MinimumWageId | undefined
  TwoPercentShareholder: typeof TwoPercentShareholder | undefined
  StateWcCovered: typeof StateWcCovered | undefined
  StateWcClassCode: typeof StateWcClassCode | undefined
}
