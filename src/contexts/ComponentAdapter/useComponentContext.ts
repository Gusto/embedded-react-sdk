import { createContext, useContext } from 'react'
import type { JSX } from 'react'
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
import type { ButtonIconProps, ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { BreadcrumbsProps } from '@/components/Common/UI/Breadcrumb/BreadcrumbTypes'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import type { LinkProps } from '@/components/Common/UI/Link/LinkTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import type { TableProps } from '@/components/Common/UI/Table'
import type { OrderedListProps, UnorderedListProps } from '@/components/Common/UI/List'

export interface ComponentsContextType {
  Alert: (props: AlertProps) => JSX.Element | null
  Badge: (props: BadgeProps) => JSX.Element | null
  Breadcrumbs: (props: BreadcrumbsProps) => JSX.Element | null
  Button: (props: ButtonProps) => JSX.Element | null
  ButtonIcon: (props: ButtonIconProps) => JSX.Element | null
  Card: (props: CardProps) => JSX.Element | null
  Checkbox: (props: CheckboxProps) => JSX.Element | null
  CheckboxGroup: (props: CheckboxGroupProps) => JSX.Element | null
  ComboBox: (props: ComboBoxProps) => JSX.Element | null
  DatePicker: (props: DatePickerProps) => JSX.Element | null
  OrderedList: (props: OrderedListProps) => JSX.Element | null
  UnorderedList: (props: UnorderedListProps) => JSX.Element | null
  NumberInput: (props: NumberInputProps) => JSX.Element | null
  Radio: (props: RadioProps) => JSX.Element | null
  RadioGroup: (props: RadioGroupProps) => JSX.Element | null
  Select: (props: SelectProps) => JSX.Element | null
  Switch: (props: SwitchProps) => JSX.Element | null
  TextInput: (props: TextInputProps) => JSX.Element | null
  Link: (props: LinkProps) => JSX.Element | null
  Menu: (props: MenuProps) => JSX.Element | null
  Table: <T>(props: TableProps<T>) => JSX.Element | null
}

export const ComponentsContext = createContext<ComponentsContextType | null>(null)

export const useComponentContext = () => {
  const context = useContext(ComponentsContext)
  if (!context) {
    throw new Error('useComponentContext must be used within a ComponentsProvider')
  }
  return context
}
