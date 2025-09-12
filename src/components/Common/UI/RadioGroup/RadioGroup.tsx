import { useContext, useRef } from 'react'
import type { Ref } from 'react'
import classNames from 'classnames'
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupStateContext,
  type RadioGroupRenderProps,
} from 'react-aria-components'
import { useRadio } from 'react-aria'
import type { AriaRadioProps } from 'react-aria'
import type React from 'react'
import { Radio } from '../Radio'
import styles from './RadioGroup.module.scss'
import type { RadioGroupProps } from './RadioGroupTypes'
import { RadioGroupDefaults } from './RadioGroupTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { Fieldset } from '@/components/Common/Fieldset'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'

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

  const handleChange = (checked: boolean) => {
    if (checked) {
      groupState.setSelectedValue(value)
    }
  }

  return (
    <Radio
      label={label}
      inputRef={handleInputRef}
      isDisabled={isDisabled}
      description={description}
      onChange={handleChange}
      value={isSelected}
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

export function RadioGroup(rawProps: RadioGroupProps) {
  const resolvedProps = applyMissingDefaults(rawProps, RadioGroupDefaults)
  const {
    label,
    description,
    errorMessage,
    isRequired,
    isInvalid,
    isDisabled,
    options,
    shouldVisuallyHideLabel,
    value,
    onChange,
    className,
    inputRef,
    ...otherProps
  } = resolvedProps
  return (
    <Fieldset
      legend={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      shouldVisuallyHideLegend={shouldVisuallyHideLabel}
      className={classNames(styles.root, className)}
      {...otherProps}
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
        {options.map(({ value, label, isDisabled, description }, index) => (
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
