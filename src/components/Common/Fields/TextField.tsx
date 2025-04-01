import type React from 'react'
import type { RegisterOptions } from 'react-hook-form'
// eslint-disable-next-line no-restricted-imports
import { TextField as AriaTextField, FieldError, Input, Label, Text } from 'react-aria-components'
import { FormField } from './FormField'
import { createMarkup } from '@/helpers/formattedStrings'

interface TextFieldProps {
  label: string
  name: string
  rules?: RegisterOptions
  defaultValue?: string
  placeholder?: string
  description?: string | React.ReactElement
  errorMessage?: string
  isRequired?: boolean
  type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'url'
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  rules,
  defaultValue = '',
  placeholder,
  description,
  errorMessage,
  isRequired,
  type = 'text',
}: TextFieldProps) => (
  <FormField label={label} name={name} rules={rules} defaultValue={defaultValue}>
    {(field, fieldState, { label: fieldLabel, errorText }) => (
      <AriaTextField
        {...field}
        isInvalid={fieldState.invalid}
        isRequired={isRequired}
        validationBehavior="aria"
        type={type}
      >
        <div className="input-text-stack">
          <Label>{fieldLabel}</Label>
          {description ? (
            typeof description === 'string' ? (
              <Text slot="description" dangerouslySetInnerHTML={createMarkup(description)} />
            ) : (
              <Text slot="description">{description}</Text>
            )
          ) : null}
        </div>
        <Input ref={field.ref} placeholder={placeholder} />
        <FieldError>{errorMessage ?? errorText ?? fieldState.error?.message}</FieldError>
      </AriaTextField>
    )}
  </FormField>
)
