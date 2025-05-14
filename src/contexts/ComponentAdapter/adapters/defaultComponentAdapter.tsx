// This is used to set the default adapter and can already be ommitted by using the
// `GustoProviderCustomUIAdapter` component. That means this is a safe file to use
// non type imports from the UI directory so the lint rule is disabled for this file.
/* eslint-disable no-restricted-imports */
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
import type { ButtonProps, ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'
import { Button } from '@/components/Common/UI/Button'
import { ButtonIcon } from '@/components/Common/UI/Button/ButtonIcon'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import { Alert } from '@/components/Common/UI/Alert/Alert'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import { Card } from '@/components/Common/UI/Card/Card'
import { Badge } from '@/components/Common/UI/Badge/Badge'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { LinkProps } from '@/components/Common/UI/Link/LinkTypes'
import { Link } from '@/components/Common/UI/Link'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import { Menu } from '@/components/Common/UI/Menu'
import type { TableProps } from '@/components/Common/UI/Table'
import { Table } from '@/components/Common/UI/Table'
import type { OrderedListProps, UnorderedListProps } from '@/components/Common/UI/List'
import { OrderedList, UnorderedList } from '@/components/Common/UI/List'
import { Heading } from '@/components/Common/UI/Heading'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import { Text } from '@/components/Common/UI/Text'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import { CalendarPreview } from '@/components/Common/UI/CalendarPreview'
import type { CalendarPreviewProps } from '@/components/Common/UI/CalendarPreview/CalendarPreviewTypes'
import type { ProgressBarProps } from '@/components/Common/UI/ProgressBar'
import { ProgressBar } from '@/components/Common/UI/ProgressBar'

export const defaultComponents: ComponentsContextType = {
  Alert: (props: AlertProps) => <Alert {...props} />,
  Badge: (props: BadgeProps) => <Badge {...props} />,
  Button: (props: ButtonProps) => <Button {...props} />,
  ButtonIcon: (props: ButtonIconProps) => <ButtonIcon {...props} />,
  Card: (props: CardProps) => <Card {...props} />,
  TextInput: (props: TextInputProps) => <TextInput {...props} />,
  Checkbox: (props: CheckboxProps) => <Checkbox {...props} />,
  CheckboxGroup: (props: CheckboxGroupProps) => <CheckboxGroup {...props} />,
  ComboBox: (props: ComboBoxProps) => <ComboBox {...props} />,
  DatePicker: (props: DatePickerProps) => <DatePicker {...props} />,
  OrderedList: (props: OrderedListProps) => <OrderedList {...props} />,
  UnorderedList: (props: UnorderedListProps) => <UnorderedList {...props} />,
  NumberInput: (props: NumberInputProps) => <NumberInput {...props} />,
  Radio: (props: RadioProps) => <Radio {...props} />,
  RadioGroup: (props: RadioGroupProps) => <RadioGroup {...props} />,
  Select: (props: SelectProps) => <Select {...props} />,
  Switch: (props: SwitchProps) => <Switch {...props} />,
  Link: (props: LinkProps) => <Link {...props} />,
  Menu: (props: MenuProps) => <Menu {...props} />,
  Table: <T,>(props: TableProps<T>) => <Table {...props} />,
  Heading: (props: HeadingProps) => <Heading {...props} />,
  Text: (props: TextProps) => <Text {...props} />,
  CalendarPreview: (props: CalendarPreviewProps) => <CalendarPreview {...props} />,
  ProgressBar: (props: ProgressBarProps) => <ProgressBar {...props} />,
}
