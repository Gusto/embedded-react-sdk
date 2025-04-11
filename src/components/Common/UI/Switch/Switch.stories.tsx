import type { Story } from '@ladle/react'
import type { ChangeEvent } from 'react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Switch } from './Switch'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Switch',
}

export const Default: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('SwitchChange', false)
  return (
    <Switch
      label="Enable notifications"
      name="notifications"
      isSelected={value}
      onChange={isSelected =>
        handleCheckboxChange({ target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>)
      }
    />
  )
}

export const WithDefaults: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('SwitchDefaultOn', true)
  return (
    <Switch
      label="Feature enabled by default"
      name="featureEnabled"
      isSelected={value}
      onChange={isSelected =>
        handleCheckboxChange({ target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>)
      }
    />
  )
}

export const WithMultipleDefaults: Story = () => {
  const { value: darkMode, handleCheckboxChange: handleDarkModeChange } = useLadleState<boolean>(
    'DarkMode',
    true,
  )
  const { value: notifications, handleCheckboxChange: handleNotificationsChange } =
    useLadleState<boolean>('Notifications', false)
  const { value: marketing, handleCheckboxChange: handleMarketingChange } = useLadleState<boolean>(
    'Marketing',
    true,
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch
        label="Dark mode (on by default)"
        name="darkMode"
        isSelected={darkMode}
        onChange={isSelected =>
          handleDarkModeChange({ target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>)
        }
      />
      <Switch
        label="Notifications (off by default)"
        name="notifications"
        isSelected={notifications}
        onChange={isSelected =>
          handleNotificationsChange({
            target: { checked: isSelected },
          } as ChangeEvent<HTMLInputElement>)
        }
      />
      <Switch
        label="Marketing emails (on by default)"
        name="marketing"
        isSelected={marketing}
        onChange={isSelected =>
          handleMarketingChange({
            target: { checked: isSelected },
          } as ChangeEvent<HTMLInputElement>)
        }
      />
    </div>
  )
}

export const WithDescription: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('SwitchWithDescription', false)
  return (
    <Switch
      label="Dark mode"
      name="darkMode"
      description="Switch to dark theme for better night-time viewing"
      isSelected={value}
      onChange={isSelected =>
        handleCheckboxChange({ target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>)
      }
    />
  )
}

export const WithError: Story = () => {
  const { value, handleCheckboxChange } = useLadleState<boolean>('SwitchWithError', false)
  return (
    <Switch
      label="Accept terms"
      name="terms"
      isInvalid
      errorMessage="You must accept the terms to continue"
      description="By enabling this, you agree to our terms of service"
      isSelected={value}
      onChange={isSelected =>
        handleCheckboxChange({ target: { checked: isSelected } } as ChangeEvent<HTMLInputElement>)
      }
    />
  )
}

export const Disabled: Story = () => {
  return <Switch label="This option is not available" name="disabled" isDisabled />
}
