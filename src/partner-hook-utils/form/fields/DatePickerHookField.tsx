import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { normalizeToDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link DatePickerHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface DatePickerHookFieldProps<TErrorCode extends string = never>
  extends BaseFieldProps, Pick<DatePickerProps, 'portalContainer' | 'minDate' | 'maxDate'> {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<DatePickerProps>
  /** When used inside a modal, pass the modal backdrop ref's element so the calendar popover stacks correctly. */
  portalContainer?: DatePickerProps['portalContainer']
}

/**
 * Date picker field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, label content, and optional date bounds.
 * @returns The rendered date picker field wrapped in the field element registry.
 * @internal
 */
export function DatePickerHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
  portalContainer,
  minDate,
  maxDate,
}: DatePickerHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return withFieldElementRegistry(
    fieldElementRegistry,
    <DatePickerField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      FieldComponent={FieldComponent}
      portalContainer={portalContainer}
      minDate={
        minDate ??
        (fieldMetadata?.minDate ? (normalizeToDate(fieldMetadata.minDate) ?? undefined) : undefined)
      }
      maxDate={
        maxDate ??
        (fieldMetadata?.maxDate ? (normalizeToDate(fieldMetadata.maxDate) ?? undefined) : undefined)
      }
    />,
  )
}
