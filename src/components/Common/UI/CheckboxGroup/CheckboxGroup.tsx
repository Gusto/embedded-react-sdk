import { useContext, useRef } from 'react'
import type { FieldsetHTMLAttributes, Ref } from 'react'
import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupStateContext,
  type CheckboxGroupRenderProps,
} from 'react-aria-components'
import { useCheckboxGroupItem } from 'react-aria'
import type { AriaCheckboxProps } from 'react-aria'
import type React from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout'
import { Fieldset } from '../Fieldset'
import { Checkbox } from '../Checkbox'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'

export type CheckboxGroupOptions = {
  label: React.ReactNode
  value: string
  isDisabled?: boolean
  description?: React.ReactNode
}

export interface CheckboxGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  isInvalid?: boolean
  isDisabled?: boolean
  options: Array<CheckboxGroupOptions>
  value?: string[]
  onChange?: (value: string[]) => void
  inputRef?: Ref<HTMLInputElement>
}

// Checkbox implementation specific to React Aria to get our checkbox to connect
// to their CheckboxGroup component
interface ReactAriaCheckboxProps extends Omit<AriaCheckboxProps, 'value'> {
  label: React.ReactNode
  description?: React.ReactNode
  value: string
  groupState: CheckboxGroupRenderProps['state']
  inputRef?: Ref<HTMLInputElement>
}

function ReactAriaCheckbox({
  label,
  description,
  value,
  groupState,
  inputRef: inputRefFromProps,
  ...props
}: ReactAriaCheckboxProps) {
  const internalInputRef = useRef<HTMLInputElement>(null)
  const handleInputRef = useForkRef(inputRefFromProps, internalInputRef)

  const { inputProps, isSelected, isDisabled, isInvalid } = useCheckboxGroupItem(
    {
      ...props,
      value,
      // Hack to suppress aria-label warning from React Aria. We don't actually
      // use children for the mapping of our checkbox to React Aria and we already
      // configure a label for our checkboxes.
      children: ' ',
      isRequired: false,
    },
    groupState,
    internalInputRef,
  )

  return (
    <Checkbox
      label={label}
      inputRef={handleInputRef}
      checked={isSelected}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      description={description}
      onChange={inputProps.onChange}
      value={inputProps.value}
      name={inputProps.name}
    />
  )
}

function ReactAriaCheckboxWrapper(props: Omit<ReactAriaCheckboxProps, 'groupState'>) {
  const groupState = useContext(CheckboxGroupStateContext)
  // We can't render hooks conditionally so we have to use useCheckboxGroupItem above but
  // groupState is only defined if the component is rendered within a CheckboxGroup
  // This wrapper component gets around that by checking if groupState is defined which
  // should always be the case for us since this component is only used within a CheckboxGroup
  return groupState ? <ReactAriaCheckbox groupState={groupState} {...props} /> : null
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  options,
  shouldVisuallyHideLabel = false,
  value,
  onChange,
  className,
  inputRef,
  ...props
}: CheckboxGroupProps) {
  return (
    <Fieldset
      legend={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      shouldVisuallyHideLegend={shouldVisuallyHideLabel}
      className={className}
      {...props}
    >
      <AriaCheckboxGroup
        isInvalid={isInvalid}
        isRequired={isRequired}
        validationBehavior="aria"
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
        aria-labelledby=" "
      >
        {options.map(({ value, label, isDisabled = false, description }, index) => (
          <ReactAriaCheckboxWrapper
            isDisabled={isDisabled}
            key={value}
            value={value}
            description={description}
            label={label}
            inputRef={index === 0 ? inputRef : undefined}
          />
        ))}
      </AriaCheckboxGroup>
    </Fieldset>
  )
}
