// Import defaults from type files to avoid pulling in component implementations
import { AlertDefaults } from '@/components/Common/UI/Alert/AlertTypes'
import { BadgeDefaults } from '@/components/Common/UI/Badge/BadgeTypes'
import { ButtonDefaults, ButtonIconDefaults } from '@/components/Common/UI/Button/ButtonTypes'
import { CheckboxDefaults } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import { CheckboxGroupDefaults } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import { MenuDefaults } from '@/components/Common/UI/Menu/MenuTypes'
import { RadioDefaults } from '@/components/Common/UI/Radio/RadioTypes'
import { RadioGroupDefaults } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import { SwitchDefaults } from '@/components/Common/UI/Switch/SwitchTypes'
import { TextDefaults } from '@/components/Common/UI/Text/TextTypes'
import { TextInputDefaults } from '@/components/Common/UI/TextInput/TextInputTypes'
// Types for registry validation
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { ButtonProps, ButtonIconProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'

/**
 * Registry of default prop values for UI components.
 * These defaults are extracted from the actual component implementations
 * and are automatically applied to custom component adapters.
 */
export const DEFAULT_PROPS_REGISTRY = {
  Alert: AlertDefaults,
  Badge: BadgeDefaults,
  Button: ButtonDefaults,
  ButtonIcon: ButtonIconDefaults,
  Checkbox: CheckboxDefaults,
  CheckboxGroup: CheckboxGroupDefaults,
  Menu: MenuDefaults,
  Radio: RadioDefaults,
  RadioGroup: RadioGroupDefaults,
  Switch: SwitchDefaults,
  Text: TextDefaults,
  TextInput: TextInputDefaults,
} as const satisfies {
  Alert: Partial<AlertProps>
  Badge: Partial<BadgeProps>
  Button: Partial<ButtonProps>
  ButtonIcon: Partial<ButtonIconProps>
  Checkbox: Partial<CheckboxProps>
  CheckboxGroup: Partial<CheckboxGroupProps>
  Menu: Partial<MenuProps>
  Radio: Partial<RadioProps>
  RadioGroup: Partial<RadioGroupProps>
  Switch: Partial<SwitchProps>
  Text: Partial<TextProps>
  TextInput: Partial<TextInputProps>
}

export type ComponentName = keyof typeof DEFAULT_PROPS_REGISTRY
