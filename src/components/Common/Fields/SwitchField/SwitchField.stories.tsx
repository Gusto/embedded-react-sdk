import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { SwitchField } from './SwitchField'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Switch',
}

export const Default: Story = () => (
  <FormWrapper>
    <SwitchField label="Enable Notifications" name="enableNotifications" />
  </FormWrapper>
)

export const Required: Story = () => {
  const Components = useComponentContext()

  return (
    <FormWrapper>
      <SwitchField
        label="Accept Terms and Conditions"
        name="acceptTerms"
        isRequired
        errorMessage="You must accept the terms"
      />
      <br />
      <div>
        <Components.Button type="submit">Submit</Components.Button>
      </div>
    </FormWrapper>
  )
}

export const WithDefaultValues: Story = () => {
  return (
    <FormWrapper
      defaultValues={{
        darkMode: true,
        autoUpdates: false,
        pushNotifications: true,
      }}
    >
      <SwitchField label="Dark Mode" name="darkMode" />
      <SwitchField label="Automatic Updates" name="autoUpdates" />
      <SwitchField label="Push Notifications" name="pushNotifications" />
    </FormWrapper>
  )
}

export const WithDescription: Story = () => (
  <FormWrapper>
    <SwitchField
      label="Enable Analytics"
      name="analytics"
      description="Help us improve by sending anonymous usage data"
    />
  </FormWrapper>
)
