import { useContext, useRef } from 'react'
import type { FieldsetHTMLAttributes, Ref } from 'react'
import classNames from 'classnames'
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupStateContext,
  type RadioGroupRenderProps,
} from 'react-aria-components'
import { useRadio } from 'react-aria'
import type { AriaRadioProps } from 'react-aria'
import type React from 'react'
import { Fieldset } from '../Fieldset'
import { Radio } from '../Radio'
import styles from './RadioGroup.module.scss'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'
import type { SharedFieldLayoutProps } from '@/types/UI/FieldLayout'

export type RadioGroupOptions = {
  label: React.ReactNode
  value: string
  isDisabled?: boolean
  description?: React.ReactNode
}

export interface RadioGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  isInvalid?: boolean
  isDisabled?: boolean
  options: Array<RadioGroupOptions>
  value?: string
  onChange?: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
}

// Radio implementation specific to React Aria to get our radio to connect
// to their RadioGroup component
interface ReactAriaRadioProps extends Omit<AriaRadioProps, 'value'> {
  label: React.ReactNode
  description?: React.ReactNode
  value: string
  groupState: RadioGroupRenderProps['state']
  inputRef?: Ref<HTMLInputElement>
}

function ReactAriaRadio({
  label,
  description,
  value,
  groupState,
  inputRef: inputRefFromProps,
  ...props
}: ReactAriaRadioProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleInputRef = useForkRef(inputRefFromProps, inputRef)

  const { inputProps, isSelected, isDisabled } = useRadio(
    {
      ...props,
      value,
      // Hack to suppress aria-label warning from React Aria. We don't actually
      // use children for the mapping of our radio to React Aria and we already
      // configure a label for our radios.
      children: ' ',
    },
    groupState,
    inputRef,
  )

  return (
    <Radio
      label={label}
      inputRef={handleInputRef}
      checked={isSelected}
      isDisabled={isDisabled}
      description={description}
      onChange={inputProps.onChange}
      value={inputProps.value}
      name={inputProps.name}
    />
  )
}

function ReactAriaRadioWrapper(props: Omit<ReactAriaRadioProps, 'groupState'>) {
  const groupState = useContext(RadioGroupStateContext)
  // We can't render hooks conditionally so we have to use useRadio above but
  // groupState is only defined if the component is rendered within a RadioGroup
  // This wrapper component gets around that by checking if groupState is defined which
  // should always be the case for us since this component is only used within a RadioGroup
  return groupState ? <ReactAriaRadio groupState={groupState} {...props} /> : null
}

export function RadioGroup({
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
}: RadioGroupProps) {
  return (
    <Fieldset
      legend={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      shouldVisuallyHideLegend={shouldVisuallyHideLabel}
      className={classNames(styles.root, className)}
      {...props}
    >
      <AriaRadioGroup
        isInvalid={isInvalid}
        isRequired={isRequired}
        validationBehavior="aria"
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
        aria-labelledby=" "
      >
        {options.map(({ value, label, isDisabled = false, description }, index) => (
          <ReactAriaRadioWrapper
            isDisabled={isDisabled}
            key={value}
            value={value}
            description={description}
            label={label}
            inputRef={index === 0 ? inputRef : undefined}
          />
        ))}
      </AriaRadioGroup>
    </Fieldset>
  )
}
