import type { ComponentType, ReactNode } from 'react'
import type { ContractorSignatureFormErrorCode } from './contractorSignatureFormSchema'
import type { W9FieldDescriptor } from './w9Fields'
import { TextInputHookField } from '@/partner-hook-utils/form/fields/TextInputHookField'
import { CheckboxHookField } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { SelectHookField } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { ValidationMessages } from '@/partner-hook-utils/types'

/**
 * Props accepted by a W-9 field component exposed on
 * `useContractorSignatureForm`'s `form.Fields`.
 *
 * @public
 */
export interface ContractorSignatureFieldProps {
  /** Visible label rendered above the field. */
  label: string
  /** Optional helper text rendered below the field. */
  description?: ReactNode
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<ContractorSignatureFormErrorCode>
  /** Placeholder text; used by text and select fields. */
  placeholder?: string
  /** Maps an option value to its display label; used by radio and select fields. */
  getOptionLabel?: (value: string) => string
}

/**
 * A W-9 field component pre-bound to its form-field name.
 *
 * @public
 */
export type ContractorSignatureBoundField = ComponentType<ContractorSignatureFieldProps>

/**
 * Map of W-9 form-field name to its bound field component.
 *
 * @public
 */
export type ContractorSignatureFields = Record<string, ContractorSignatureBoundField>

/**
 * The form-field name of the electronic-signature consent checkbox.
 *
 * @internal
 */
export const AGREE_FIELD = 'agree'

function boundField(
  name: string,
  variant: W9FieldDescriptor['variant'],
): ContractorSignatureBoundField {
  switch (variant) {
    case 'checkbox':
      return function BoundCheckbox(props: ContractorSignatureFieldProps) {
        return <CheckboxHookField {...props} name={name} />
      }
    case 'radio':
      return function BoundRadioGroup(props: ContractorSignatureFieldProps) {
        return <RadioGroupHookField {...props} name={name} />
      }
    case 'select':
      return function BoundSelect({ placeholder, ...props }: ContractorSignatureFieldProps) {
        return <SelectHookField placeholder={placeholder ?? ''} {...props} name={name} />
      }
    default:
      return function BoundTextInput(props: ContractorSignatureFieldProps) {
        return <TextInputHookField {...props} name={name} />
      }
  }
}

/**
 * Builds the map of bound field components for a W-9 signing form, including
 * the always-present `agree` consent checkbox.
 *
 * @param descriptors - The descriptors produced by `buildW9FieldDescriptors`.
 * @returns A {@link ContractorSignatureFields} map keyed by form-field name.
 * @internal
 */
export function buildContractorSignatureFields(
  descriptors: W9FieldDescriptor[],
): ContractorSignatureFields {
  const fields: ContractorSignatureFields = {}
  for (const descriptor of descriptors) {
    fields[descriptor.name] = boundField(descriptor.name, descriptor.variant)
  }
  fields[AGREE_FIELD] = boundField(AGREE_FIELD, 'checkbox')
  return fields
}
