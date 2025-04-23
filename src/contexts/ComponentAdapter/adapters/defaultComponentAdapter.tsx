import type { ComponentsContextType } from '../useComponentContext'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import { TextInput } from '@/components/Common/UI/TextInput'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import { NumberInput } from '@/components/Common/UI/NumberInput'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import { CheckboxGroup } from '@/components/Common/UI/CheckboxGroup'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import { ComboBox } from '@/components/Common/UI/ComboBox/ComboBox'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { Checkbox } from '@/components/Common/UI/Checkbox'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { DatePicker } from '@/components/Common/UI/DatePicker'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import { Radio } from '@/components/Common/UI/Radio'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import { RadioGroup } from '@/components/Common/UI/RadioGroup'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import { Select } from '@/components/Common/UI/Select'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import { Switch } from '@/components/Common/UI/Switch'

export const defaultComponents: ComponentsContextType = {
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
