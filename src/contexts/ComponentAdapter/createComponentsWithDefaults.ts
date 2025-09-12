import type React from 'react'
import type { ComponentsContextType } from './useComponentContext'
import { defaultComponents } from './adapters/defaultComponentAdapter'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
// Import prop types and their defaults
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import { AlertDefaults } from '@/components/Common/UI/Alert/AlertTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import { BadgeDefaults } from '@/components/Common/UI/Badge/BadgeTypes'
import type { ButtonProps, ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'
import { ButtonDefaults, ButtonIconDefaults } from '@/components/Common/UI/Button/ButtonTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { CheckboxDefaults } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import { CheckboxGroupDefaults } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import { MenuDefaults } from '@/components/Common/UI/Menu/MenuTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import { RadioDefaults } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import { RadioGroupDefaults } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import { SwitchDefaults } from '@/components/Common/UI/Switch/SwitchTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import { TextDefaults } from '@/components/Common/UI/Text/TextTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import { TextInputDefaults } from '@/components/Common/UI/TextInput/TextInputTypes'

// Generic helper to compose components with defaults
function composeWithDefaults<TProps>(defaults: Partial<TProps>, componentName: string) {
  return (customComponent: (props: TProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: TProps) => {
      const propsWithDefaults = applyMissingDefaults(props, defaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = `withAutoDefault(${componentName})`
    return wrappedComponent
  }
}

// Type-safe component creators for each component with defaults
export const componentCreators = {
  Alert: composeWithDefaults<AlertProps>(AlertDefaults, 'Alert'),
  Badge: composeWithDefaults<BadgeProps>(BadgeDefaults, 'Badge'),
  Button: composeWithDefaults<ButtonProps>(ButtonDefaults, 'Button'),
  ButtonIcon: composeWithDefaults<ButtonIconProps>(ButtonIconDefaults, 'ButtonIcon'),
  Checkbox: composeWithDefaults<CheckboxProps>(CheckboxDefaults, 'Checkbox'),
  CheckboxGroup: composeWithDefaults<CheckboxGroupProps>(CheckboxGroupDefaults, 'CheckboxGroup'),
  Menu: composeWithDefaults<MenuProps>(MenuDefaults, 'Menu'),
  Radio: composeWithDefaults<RadioProps>(RadioDefaults, 'Radio'),
  RadioGroup: composeWithDefaults<RadioGroupProps>(RadioGroupDefaults, 'RadioGroup'),
  Switch: composeWithDefaults<SwitchProps>(SwitchDefaults, 'Switch'),
  Text: composeWithDefaults<TextProps>(TextDefaults, 'Text'),
  TextInput: composeWithDefaults<TextInputProps>(TextInputDefaults, 'TextInput'),
} as const

/**
 * Creates a complete ComponentsContextType with type-safe default prop handling.
 * Custom components automatically receive defaults from the registry while maintaining full type safety.
 */
export function createComponents(
  customComponents: Partial<ComponentsContextType> = {},
): ComponentsContextType {
  const components = { ...defaultComponents }

  // Handle each component type explicitly with proper typing
  if (customComponents.Alert) {
    components.Alert = componentCreators.Alert(customComponents.Alert)
  }
  if (customComponents.Badge) {
    components.Badge = componentCreators.Badge(customComponents.Badge)
  }
  if (customComponents.Button) {
    components.Button = componentCreators.Button(customComponents.Button)
  }
  if (customComponents.ButtonIcon) {
    components.ButtonIcon = componentCreators.ButtonIcon(customComponents.ButtonIcon)
  }
  if (customComponents.Checkbox) {
    components.Checkbox = componentCreators.Checkbox(customComponents.Checkbox)
  }
  if (customComponents.CheckboxGroup) {
    components.CheckboxGroup = componentCreators.CheckboxGroup(customComponents.CheckboxGroup)
  }
  if (customComponents.Menu) {
    components.Menu = componentCreators.Menu(customComponents.Menu)
  }
  if (customComponents.Radio) {
    components.Radio = componentCreators.Radio(customComponents.Radio)
  }
  if (customComponents.RadioGroup) {
    components.RadioGroup = componentCreators.RadioGroup(customComponents.RadioGroup)
  }
  if (customComponents.Switch) {
    components.Switch = componentCreators.Switch(customComponents.Switch)
  }
  if (customComponents.Text) {
    components.Text = componentCreators.Text(customComponents.Text)
  }
  if (customComponents.TextInput) {
    components.TextInput = componentCreators.TextInput(customComponents.TextInput)
  }

  // Handle components without defaults explicitly to maintain type safety
  if (customComponents.Card) components.Card = customComponents.Card
  if (customComponents.ComboBox) components.ComboBox = customComponents.ComboBox
  if (customComponents.DatePicker) components.DatePicker = customComponents.DatePicker
  if (customComponents.OrderedList) components.OrderedList = customComponents.OrderedList
  if (customComponents.UnorderedList) components.UnorderedList = customComponents.UnorderedList
  if (customComponents.NumberInput) components.NumberInput = customComponents.NumberInput
  if (customComponents.Select) components.Select = customComponents.Select
  if (customComponents.Link) components.Link = customComponents.Link
  if (customComponents.Table) components.Table = customComponents.Table
  if (customComponents.Heading) components.Heading = customComponents.Heading
  if (customComponents.PaginationControl)
    components.PaginationControl = customComponents.PaginationControl
  if (customComponents.CalendarPreview)
    components.CalendarPreview = customComponents.CalendarPreview
  if (customComponents.ProgressBar) components.ProgressBar = customComponents.ProgressBar

  return components
}
