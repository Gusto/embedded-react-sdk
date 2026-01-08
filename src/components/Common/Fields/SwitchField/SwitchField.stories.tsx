import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { SwitchField } from './SwitchField'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// Adding a meta object for title
export default {
  title: 'UI/Form/Fields/Switch',
}

export const Default = () => (
  <FormWrapper>
    <SwitchField label="Enable Notifications" name="enableNotifications" />
  </FormWrapper>
)

export const Required = () => {
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

export const WithDefaultValues = () => {
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

export const WithDescription = () => (
  <FormWrapper>
    <SwitchField
      label="Enable Analytics"
      name="analytics"
      description="Help us improve by sending anonymous usage data"
    />
  </FormWrapper>
)
