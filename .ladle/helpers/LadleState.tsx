import { action } from '@ladle/react'
import { useState } from 'react'

/**
 * Creates a handler that logs actions to Ladle's action panel and manages component state
 * @param actionName The name of the action to display in Ladle
 * @returns Functions and state for handling component events
 */
export function useLadleState<T>(actionName: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue)

  const handleAction = (newValue: T) => {
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  // For input elements that pass event objects
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value as unknown as T
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  // For checkbox elements that pass checked event
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked as unknown as T
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  // For switch components that directly pass the checked value
  const handleSwitchChange = (checked: boolean) => {
    const newValue = checked as unknown as T
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked as unknown as T
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  const handleCheckboxGroupChange = (newValue: T) => {
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  const handleRadioGroupChange = (newValue: T) => {
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  // For select elements that directly pass the value
  const handleSelectChange = (newValue: T) => {
    action(actionName)(newValue)
    setValue(newValue)
    return newValue
  }

  // For blur events
  const handleBlur = () => {
    action(`${actionName}Blur`)('Component blurred')
  }

  return {
    value,
    setValue,
    handleAction,
    handleInputChange,
    handleCheckboxChange,
    handleSwitchChange,
    handleRadioChange,
    handleCheckboxGroupChange,
    handleRadioGroupChange,
    handleSelectChange,
    handleBlur,
  }
}
