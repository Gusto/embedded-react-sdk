import type { ComponentType, ReactNode } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { RadioGroupField } from '@/components/Common'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Props accepted by a radio group field surfaced through a form hook.
 * Exposes `getOptionLabel` and `getOptionDescription` to customize how option entries are
 * rendered, and `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel` and `getOptionDescription`.
 * @public
 * @group Hook field props
 */
export interface RadioGroupHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Maps a raw option entry to its display label; when omitted, options use the labels provided by the hook. */
  getOptionLabel?: (entry: TEntry) => string
  /** Maps a raw option entry to supporting text rendered beneath that radio option; when omitted, no per-option description is rendered. */
  getOptionDescription?: (entry: TEntry) => ReactNode
  /** Replaces the default radio group UI component; must accept the same props as `RadioGroupProps`. */
  FieldComponent?: ComponentType<RadioGroupProps>
}

/**
 * Radio group field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel` and `getOptionDescription`.
 * @param props - Field configuration including `name`, `formHookResult`, and optional `getOptionLabel` / `getOptionDescription`.
 * @returns The rendered radio group field wrapped in the field element registry.
 * @internal
 */
export function RadioGroupHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  getOptionDescription,
  FieldComponent,
}: RadioGroupHookFieldProps<TErrorCode, TEntry>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = getFieldWithOptions<TEntry>(metadata, name)

  const defaultOptions = fieldMetadata?.options ?? []
  // Either callback needs `entries` to map over; whichever one is omitted falls back to the
  // label the hook already supplied / no description.
  const options =
    (getOptionLabel ?? getOptionDescription) && fieldMetadata?.entries
      ? fieldMetadata.entries.map((entry, index) => ({
          value: defaultOptions[index]?.value ?? '',
          label: getOptionLabel ? getOptionLabel(entry) : (defaultOptions[index]?.label ?? ''),
          ...(getOptionDescription ? { description: getOptionDescription(entry) } : {}),
        }))
      : defaultOptions

  return withFieldElementRegistry(
    fieldElementRegistry,
    <RadioGroupField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
      FieldComponent={FieldComponent}
    />,
  )
}
