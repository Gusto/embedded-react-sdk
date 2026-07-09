import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { normalizeToDate } from '@/helpers/dateFormatting'

/**
 * Props accepted by a date picker field surfaced through a form hook.
 * Exposes `minDate` and `maxDate` bounds (override server-provided constraints when
 * supplied), `portalContainer` for correct stacking inside modals, and
 * `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 * @group Hook field props
 */
export interface DatePickerHookFieldProps<TErrorCode extends string = never>
  extends BaseFieldProps, Pick<DatePickerProps, 'portalContainer' | 'minDate' | 'maxDate'> {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Replaces the default date picker UI component; must accept the same props as `DatePickerProps`. */
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
