import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesErrorCodes } from './employeeStateTaxesSchema'
import type { BoundFieldMeta } from './fieldMeta'
import type {
  BaseStateTaxFieldProps,
  CurrencyStateTaxFieldProps,
  DateStateTaxFieldProps,
  NumberStateTaxFieldProps,
  RadioStateTaxFieldProps,
  SelectStateTaxFieldProps,
  StateTaxValidationMessages,
  TextStateTaxFieldProps,
} from './fieldProps'
import {
  SelectHookField,
  RadioGroupHookField,
  TextInputHookField,
  NumberInputHookField,
  DatePickerHookField,
} from '@/partner-hook-utils/form/fields'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import type { FormHookResult } from '@/partner-hook-utils/types'

interface MetaProps {
  meta: BoundFieldMeta
}

function useStateTaxValidationDefaults(): StateTaxValidationMessages {
  const { t } = useTranslation('Employee.StateTaxesView')
  return { [EmployeeStateTaxesErrorCodes.REQUIRED]: t('validations.required') }
}

function useResolvedBaseProps(
  meta: BoundFieldMeta,
  props: BaseStateTaxFieldProps,
): {
  name: string
  label: string
  description: ReactNode
  formHookResult: FormHookResult | undefined
  validationMessages: StateTaxValidationMessages
} {
  const defaults = useStateTaxValidationDefaults()
  return {
    name: meta.name,
    label: props.label ?? meta.apiLabel,
    description: props.description !== undefined ? props.description : meta.apiDescription,
    formHookResult: props.formHookResult,
    validationMessages: { ...defaults, ...props.validationMessages },
  }
}

/** @internal */
export function SelectStateTaxField({ meta, ...props }: MetaProps & SelectStateTaxFieldProps) {
  const { t } = useTranslation('common')
  const base = useResolvedBaseProps(meta, props)
  const hookProps: SelectHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    placeholder: props.placeholder ?? t('selectPlaceholder'),
    FieldComponent: props.FieldComponent,
  }
  return <SelectHookField {...hookProps} />
}

/** @internal */
export function RadioStateTaxField({ meta, ...props }: MetaProps & RadioStateTaxFieldProps) {
  const base = useResolvedBaseProps(meta, props)
  const hookProps: RadioGroupHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    FieldComponent: props.FieldComponent,
  }
  return <RadioGroupHookField {...hookProps} />
}

/** @internal */
export function TextStateTaxField({ meta, ...props }: MetaProps & TextStateTaxFieldProps) {
  const base = useResolvedBaseProps(meta, props)
  const hookProps: TextInputHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    placeholder: props.placeholder,
  }
  return <TextInputHookField {...hookProps} />
}

/** @internal */
export function NumberStateTaxField({ meta, ...props }: MetaProps & NumberStateTaxFieldProps) {
  const base = useResolvedBaseProps(meta, props)
  const hookProps: NumberInputHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    format: 'decimal',
    FieldComponent: props.FieldComponent,
  }
  return <NumberInputHookField {...hookProps} />
}

/** @internal */
export function CurrencyStateTaxField({ meta, ...props }: MetaProps & CurrencyStateTaxFieldProps) {
  const base = useResolvedBaseProps(meta, props)
  const hookProps: NumberInputHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    format: 'currency',
    FieldComponent: props.FieldComponent,
  }
  return <NumberInputHookField {...hookProps} />
}

/** @internal */
export function DateStateTaxField({ meta, ...props }: MetaProps & DateStateTaxFieldProps) {
  const base = useResolvedBaseProps(meta, props)
  const hookProps: DatePickerHookFieldProps<typeof EmployeeStateTaxesErrorCodes.REQUIRED> = {
    ...base,
    FieldComponent: props.FieldComponent,
  }
  return <DatePickerHookField {...hookProps} />
}
