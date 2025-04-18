import type React from 'react'
import type { JSX } from 'react'
import { createContext, useMemo, useContext } from 'react'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'

export interface ComponentsContextType {
  Checkbox: (props: CheckboxProps) => JSX.Element | null
  CheckboxGroup: (props: CheckboxGroupProps) => JSX.Element | null
  ComboBox: (props: ComboBoxProps) => JSX.Element | null
  DatePicker: (props: DatePickerProps) => JSX.Element | null
  NumberInput: (props: NumberInputProps) => JSX.Element | null
  Radio: (props: RadioProps) => JSX.Element | null
  RadioGroup: (props: RadioGroupProps) => JSX.Element | null
  Select: (props: SelectProps) => JSX.Element | null
  Switch: (props: SwitchProps) => JSX.Element | null
  TextInput: (props: TextInputProps) => JSX.Element | null
}

// Create a context without default value, requiring consumers to provide one
const ComponentsContext = createContext<ComponentsContextType | null>(null)

export const useComponentContext = () => {
  const context = useContext(ComponentsContext)
  if (!context) {
    throw new Error('useComponentContext must be used within a ComponentsProvider')
  }
  return context
}

interface ComponentsProviderProps {
  children: React.ReactNode
  value: ComponentsContextType
}

export const ComponentsProvider = ({ children, value }: ComponentsProviderProps) => {
  const contextValue = useMemo(() => {
    return value
  }, [value]) // This is intentional to make the component context immutable

  return <ComponentsContext.Provider value={contextValue}>{children}</ComponentsContext.Provider>
}
