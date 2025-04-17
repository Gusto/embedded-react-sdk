import type React from 'react'
import type { JSX } from 'react'
import { createContext, useMemo, lazy, useContext } from 'react'
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

const TextInput = lazy(() =>
  import('@/components/Common/UI/TextInput').then(module => ({ default: module.TextInput })),
)

const Checkbox = lazy(() =>
  import('@/components/Common/UI/Checkbox').then(module => ({ default: module.Checkbox })),
)

const CheckboxGroup = lazy(() =>
  import('@/components/Common/UI/CheckboxGroup').then(module => ({
    default: module.CheckboxGroup,
  })),
)

const ComboBox = lazy(() =>
  import('@/components/Common/UI/ComboBox/ComboBox').then(module => ({ default: module.ComboBox })),
)

const DatePicker = lazy(() =>
  import('@/components/Common/UI/DatePicker').then(module => ({ default: module.DatePicker })),
)

const NumberInput = lazy(() =>
  import('@/components/Common/UI/NumberInput').then(module => ({ default: module.NumberInput })),
)

const Radio = lazy(() =>
  import('@/components/Common/UI/Radio').then(module => ({ default: module.Radio })),
)

const RadioGroup = lazy(() =>
  import('@/components/Common/UI/RadioGroup').then(module => ({ default: module.RadioGroup })),
)

const Select = lazy(() =>
  import('@/components/Common/UI/Select').then(module => ({ default: module.Select })),
)

const Switch = lazy(() =>
  import('@/components/Common/UI/Switch').then(module => ({ default: module.Switch })),
)

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

const defaultComponents: ComponentsContextType = {
  TextInput: (props: TextInputProps) => <TextInput {...props} />,
  Checkbox: (props: CheckboxProps) => <Checkbox {...props} />,
  CheckboxGroup: (props: CheckboxGroupProps) => <CheckboxGroup {...props} />,
  ComboBox: (props: ComboBoxProps) => <ComboBox {...props} />,
  DatePicker: (props: DatePickerProps) => <DatePicker {...props} />,
  NumberInput: (props: NumberInputProps) => <NumberInput {...props} />,
  Radio: (props: RadioProps) => <Radio {...props} />,
  RadioGroup: (props: RadioGroupProps) => <RadioGroup {...props} />,
  Select: (props: SelectProps) => <Select {...props} />,
  Switch: (props: SwitchProps) => <Switch {...props} />,
}

const ComponentsContext = createContext<ComponentsContextType>(defaultComponents)

export const useComponentContext = () => {
  return useContext(ComponentsContext)
}

interface ComponentsProviderProps {
  children: React.ReactNode
  value?: Partial<ComponentsContextType>
}

export const ComponentsProvider = ({ children, value = {} }: ComponentsProviderProps) => {
  const contextValue: ComponentsContextType = useMemo(() => {
    return {
      ...defaultComponents,
      ...value,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // This is intentional to make the component context immutable

  return <ComponentsContext.Provider value={contextValue}>{children}</ComponentsContext.Provider>
}
