//TODO: This wrapper brings more confusion then help -> revisit its necessity
import { forwardRef } from 'react'
import {
  DateField as _DateField,
  DateInput as _DateInput,
  DateSegment,
  FieldError,
  Label,
  Text,
} from 'react-aria-components'
import type { DateFieldProps, DateValue, ValidationResult } from 'react-aria-components'

interface DateInputFieldProps<T extends DateValue> extends DateFieldProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
}

export const DateField = forwardRef(function <T extends DateValue>(
  { label, description, errorMessage, ...props }: DateInputFieldProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <_DateField {...props} ref={ref}>
      <Label>{label}</Label>
      <_DateInput>{segment => <DateSegment segment={segment} />}</_DateInput>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </_DateField>
  )
})
DateField.displayName = 'DateField'
