import IconChecked from '@/assets/icons/checkbox.svg?react'
import IconCheckedIndeterminate from '@/assets/icons/checkbox_indeterminate.svg?react'
import { forwardRef, useId, type ReactNode } from 'react'
import {
  Checkbox as _Checkbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'

interface DisconnectedCheckboxProps extends AriaCheckboxProps {
  description?: string | ReactNode
  children: ReactNode
}

type CheckboxProps<C extends FieldValues, N extends FieldPath<C>> = {
  control: Control<C>
  name: N
  isRequired?: boolean
} & Omit<DisconnectedCheckboxProps, 'isSelected' | 'onChange' | 'defaultSelected'>

export const DisconnectedCheckbox = forwardRef<HTMLDivElement, DisconnectedCheckboxProps>(
  ({ children, description, isRequired, ...props }, ref) => {
    const descriptionId = useId()

    return (
      <div>
        <_Checkbox
          {...props}
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
  },
)

export const Checkbox = <C extends FieldValues, N extends FieldPath<C>>({
  control,
  name,
  children,
  description,
  isRequired,
  ...props
}: CheckboxProps<C, N>) => {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control })

  return (
    <DisconnectedCheckbox
      {...field}
      {...props}
      description={description}
      isSelected={field.value}
      isInvalid={invalid}
      validationBehavior="aria"
      ref={ref => {
        field.ref(ref)
      }}
    >
      {children}
    </DisconnectedCheckbox>
  )
}
Checkbox.displayName = 'Checkbox'
DisconnectedCheckbox.displayName = 'DisconnectedCheckbox'
