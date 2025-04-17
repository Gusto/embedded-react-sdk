import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { Switch } from './Switch'

// Adding a meta object for title
export default {
  title: 'UI/Form/Inputs/Switch',
}

export const Default: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('SwitchChange', false)
  return (
    <Switch
      label="Enable notifications"
      name="notifications"
      value={value}
      onChange={handleChange}
    />
  )
}

export const WithDefaults: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('SwitchDefaultOn', true)
  return (
    <Switch
      label="Feature enabled by default"
      name="featureEnabled"
      value={value}
      onChange={handleChange}
    />
  )
}

export const WithMultipleDefaults: Story = () => {
  const { value: darkMode, handleChange: handleDarkModeChange } = useLadleState<boolean>(
    'DarkMode',
    true,
  )
  const { value: notifications, handleChange: handleNotificationsChange } = useLadleState<boolean>(
    'Notifications',
    false,
  )
  const { value: marketing, handleChange: handleMarketingChange } = useLadleState<boolean>(
    'Marketing',
    true,
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch
        label="Dark mode (on by default)"
        name="darkMode"
        value={darkMode}
        onChange={handleDarkModeChange}
      />
      <Switch
        label="Notifications (off by default)"
        name="notifications"
        value={notifications}
        onChange={handleNotificationsChange}
      />
      <Switch
        label="Marketing emails (on by default)"
        name="marketing"
        value={marketing}
        onChange={handleMarketingChange}
      />
    </div>
  )
}

export const WithDescription: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('SwitchWithDescription', false)
  return (
    <Switch
      label="Dark mode"
      name="darkMode"
      description="Switch to dark theme for better night-time viewing"
      value={value}
      onChange={handleChange}
    />
  )
}

export const WithError: Story = () => {
  const { value, handleChange } = useLadleState<boolean>('SwitchWithError', false)
  return (
    <Switch
      label="Accept terms"
      name="terms"
      isInvalid
      errorMessage="You must accept the terms to continue"
      description="By enabling this, you agree to our terms of service"
      value={value}
      onChange={handleChange}
    />
  )
}

export const Disabled: Story = () => {
  return <Switch label="This option is not available" name="disabled" isDisabled />
}
