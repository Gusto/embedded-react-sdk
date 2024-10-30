import IconChecked from '@/assets/icons/checkbox.svg?react'
import IconCheckedIndeterminate from '@/assets/icons/checkbox_indeterminate.svg?react'
import { useId, type ReactNode } from 'react'
import {
  Checkbox as _Checkbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

type CheckboxProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  children: ReactNode
  name: N
  description?: string | ReactNode
  isRequired?: boolean
} & Omit<AriaCheckboxProps, 'isSelected' | 'onChange' | 'defaultSelected'>

export const Checkbox = <C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  children,
  description,
  isRequired,
  ...props
}: CheckboxProps<C, N>) => {
  const descriptionId = useId()
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <div>
      <_Checkbox
        {...props}
        {...field}
        isSelected={field.value}
        isInvalid={invalid}
        isRequired={isRequired}
        validationBehavior="aria"
        aria-describedby={descriptionId}
      >
        {({ isIndeterminate }) => (
          <>
            <div className="checkbox">
              {isIndeterminate ? <IconCheckedIndeterminate /> : <IconChecked />}
            </div>

            <div className="checkbox-details">
              {children}
              {description && (
                <small id={descriptionId} className="react-aria-Checkbox-description">
                  {description}
                </small>
              )}
            </div>
          </>
        )}
      </_Checkbox>
    </div>
  )
}
Checkbox.displayName = 'Checkbox'
