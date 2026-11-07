import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { ComboBoxField } from '@/components/Common'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'

/**
 * Props accepted by a combo box field surfaced through a form hook.
 * Exposes `getOptionLabel` to customize how option entries are rendered as labels,
 * `placeholder` text, `portalContainer` for correct stacking inside modals,
 * and `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @remarks
 * Prefer this over `SelectHookFieldProps` when the option list is long enough that
 * the user needs type-ahead filtering to find an entry. The underlying control
 * matches on the option's `value`, so a stored value with no matching option
 * renders as empty — hooks are responsible for supplying an option for whatever
 * value they place in the form.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @public
 * @group Hook field props
 */
export interface ComboBoxHookFieldProps<TErrorCode extends string = never, TEntry = unknown>
  extends BaseFieldProps, Pick<ComboBoxProps, 'portalContainer'> {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Maps a raw option entry to its display label; when omitted, options use the labels provided by the hook. */
  getOptionLabel?: (entry: TEntry) => string
  /**
   * Placeholder text displayed when no option is selected.
   * Required so empty dropdowns always communicate the action — pass an empty string only when a default value is guaranteed.
   */
  placeholder: string
  /** When used inside a modal, pass the modal backdrop ref's element so the listbox stacks correctly. */
  portalContainer?: ComboBoxProps['portalContainer']
}

/**
 * Combo box field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @param props - Field configuration including `name`, `formHookResult`, and an optional `getOptionLabel`.
 * @returns The rendered combo box field wrapped in the field element registry.
 * @internal
 */
export function ComboBoxHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  placeholder,
  portalContainer,
}: ComboBoxHookFieldProps<TErrorCode, TEntry>) {
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
    <ComboBoxField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
      placeholder={placeholder}
      portalContainer={portalContainer}
    />,
  )
}
