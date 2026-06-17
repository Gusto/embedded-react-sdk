import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { SelectField } from '@/components/Common'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'

/**
 * Props accepted by a select field surfaced through a form hook.
 * Exposes `getOptionLabel` to customize how option entries are rendered as labels,
 * `placeholder` text, `portalContainer` for correct stacking inside modals,
 * and `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @public
 */
export interface SelectHookFieldProps<TErrorCode extends string = never, TEntry = unknown>
  extends BaseFieldProps, Pick<SelectProps, 'portalContainer'> {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Maps a raw option entry to its display label; when omitted, options use the labels provided by the hook. */
  getOptionLabel?: (entry: TEntry) => string
  /** Placeholder text displayed when no option is selected. */
  placeholder?: string
  /** Replaces the default select UI component; must accept the same props as `SelectProps`. */
  FieldComponent?: ComponentType<SelectProps>
  /** When used inside a modal, pass the modal backdrop ref's element so the listbox stacks correctly. */
  portalContainer?: SelectProps['portalContainer']
}

/**
 * Select field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @remarks
 * Use inside a form hook's `FormProvider` when you need a custom layout instead of the
 * hook's pre-built `Fields`. Connect to a specific hook result via `formHookResult`, or
 * omit it to read from the nearest {@link SDKFormProvider}.
 *
 * Options are read from the hook's field metadata. Supply `getOptionLabel` to derive
 * display labels from the raw entries returned by the hook instead of using the
 * hook-provided labels.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @param props - Field configuration including `name`, `formHookResult`, and an optional `getOptionLabel`.
 * @returns The rendered select field wrapped in the field element registry.
 * @public
 */
export function SelectHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  placeholder,
  FieldComponent,
  portalContainer,
}: SelectHookFieldProps<TErrorCode, TEntry>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = getFieldWithOptions<TEntry>(metadata, name)

  const defaultOptions = fieldMetadata?.options ?? []
  const options =
    getOptionLabel && fieldMetadata?.entries
      ? fieldMetadata.entries.map((entry, index) => ({
          value: defaultOptions[index]?.value ?? '',
          label: getOptionLabel(entry),
        }))
      : defaultOptions

  return withFieldElementRegistry(
    fieldElementRegistry,
    <SelectField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
      portalContainer={portalContainer}
    />,
  )
}
