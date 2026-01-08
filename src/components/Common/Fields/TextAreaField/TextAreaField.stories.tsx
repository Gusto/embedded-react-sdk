import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { TextAreaField } from './TextAreaField'

export default {
  title: 'UI/Form/Fields/TextArea',
}

export const Default = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" />
  </FormWrapper>
)

export const WithPlaceholder = () => (
  <FormWrapper>
    <TextAreaField
      name="description"
      label="Description"
      placeholder="Enter your description here..."
    />
  </FormWrapper>
)

export const WithDescription = () => (
  <FormWrapper>
    <TextAreaField
      name="description"
      label="Description"
      description="Please provide a detailed description"
    />
  </FormWrapper>
)

export const Required = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" isRequired />
  </FormWrapper>
)

export const WithError = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" errorMessage="This field is required" />
  </FormWrapper>
)

export const Disabled = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" isDisabled />
  </FormWrapper>
)

export const CustomRows = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" rows={8} />
  </FormWrapper>
)

export const WithDefaultValue = () => (
  <FormWrapper
    defaultValues={{
      description: 'This is the default text',
    }}
  >
    <TextAreaField name="description" label="Description" />
  </FormWrapper>
)
