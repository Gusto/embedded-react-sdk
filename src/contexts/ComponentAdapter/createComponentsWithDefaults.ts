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

// Helper to compose components with defaults
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

// Component creators with defaults
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
 * Creates components with automatic default prop handling.
 * Supports both partial (GustoProvider) and full (GustoProviderCustomUIAdapter) component sets.
 */
export function createComponents(
  providedComponents: Partial<ComponentsContextType> = {},
): ComponentsContextType {
  const components = { ...defaultComponents }

  // Apply defaults to provided components
  for (const componentName in providedComponents) {
    const typedComponentName = componentName as keyof ComponentsContextType
    const providedComponent = providedComponents[typedComponentName]

    if (providedComponent) {
      const creator = componentCreators[componentName as keyof typeof componentCreators]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (creator) {
        ;(components as Record<string, unknown>)[componentName] = creator(
          providedComponent as never,
        )
      } else {
        ;(components as Record<string, unknown>)[componentName] = providedComponent
      }
    }
  }

  return components
}
