import { fn } from '@storybook/test'
import { useState } from 'react'

/**
 * Creates a handler that logs actions to Storybook's action panel and manages component state
 * @param actionName The name of the action to display in Storybook
 * @returns Functions and state for handling component events
 */
export function useStoryState<T>(actionName: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const logAction = fn().mockName(actionName)
  const logBlur = fn().mockName(`${actionName}Blur`)

  const handleChange = (newValue: T) => {
    logAction(newValue)
    setValue(newValue)
    return newValue
  }

  const handleBlur = () => {
    logBlur('Component blurred')
  }

  return {
    value,
    setValue,
    handleChange,
    handleBlur,
  }
}
