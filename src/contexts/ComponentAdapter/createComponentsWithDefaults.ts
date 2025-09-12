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

// Type-safe component creators for each component with defaults
export const componentCreators = {
  Alert: (customComponent: (props: AlertProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: AlertProps) => {
      const propsWithDefaults = applyMissingDefaults(props, AlertDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Alert)'
    return wrappedComponent
  },

  Badge: (customComponent: (props: BadgeProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: BadgeProps) => {
      const propsWithDefaults = applyMissingDefaults(props, BadgeDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Badge)'
    return wrappedComponent
  },

  Button: (customComponent: (props: ButtonProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: ButtonProps) => {
      const propsWithDefaults = applyMissingDefaults(props, ButtonDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Button)'
    return wrappedComponent
  },

  ButtonIcon: (customComponent: (props: ButtonIconProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: ButtonIconProps) => {
      const propsWithDefaults = applyMissingDefaults(props, ButtonIconDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(ButtonIcon)'
    return wrappedComponent
  },

  Checkbox: (customComponent: (props: CheckboxProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: CheckboxProps) => {
      const propsWithDefaults = applyMissingDefaults(props, CheckboxDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Checkbox)'
    return wrappedComponent
  },

  CheckboxGroup: (customComponent: (props: CheckboxGroupProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: CheckboxGroupProps) => {
      const propsWithDefaults = applyMissingDefaults(props, CheckboxGroupDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(CheckboxGroup)'
    return wrappedComponent
  },

  Menu: (customComponent: (props: MenuProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: MenuProps) => {
      const propsWithDefaults = applyMissingDefaults(props, MenuDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Menu)'
    return wrappedComponent
  },

  Radio: (customComponent: (props: RadioProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: RadioProps) => {
      const propsWithDefaults = applyMissingDefaults(props, RadioDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Radio)'
    return wrappedComponent
  },

  RadioGroup: (customComponent: (props: RadioGroupProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: RadioGroupProps) => {
      const propsWithDefaults = applyMissingDefaults(props, RadioGroupDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(RadioGroup)'
    return wrappedComponent
  },

  Switch: (customComponent: (props: SwitchProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: SwitchProps) => {
      const propsWithDefaults = applyMissingDefaults(props, SwitchDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Switch)'
    return wrappedComponent
  },

  Text: (customComponent: (props: TextProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: TextProps) => {
      const propsWithDefaults = applyMissingDefaults(props, TextDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(Text)'
    return wrappedComponent
  },

  TextInput: (customComponent: (props: TextInputProps) => React.ReactElement | null) => {
    const wrappedComponent = (props: TextInputProps) => {
      const propsWithDefaults = applyMissingDefaults(props, TextInputDefaults)
      return customComponent(propsWithDefaults)
    }
    wrappedComponent.displayName = 'withAutoDefault(TextInput)'
    return wrappedComponent
  },
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
