import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../../.ladle/helpers/FormWrapper'
import { TextAreaField } from './TextAreaField'

export default {
  title: 'UI/Form/Fields/TextArea',
}

export const Default: Story = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" />
  </FormWrapper>
)

export const WithPlaceholder: Story = () => (
  <FormWrapper>
    <TextAreaField
      name="description"
      label="Description"
      placeholder="Enter your description here..."
    />
  </FormWrapper>
)

export const WithDescription: Story = () => (
  <FormWrapper>
    <TextAreaField
      name="description"
      label="Description"
      description="Please provide a detailed description"
    />
  </FormWrapper>
)

export const Required: Story = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" isRequired />
  </FormWrapper>
)

export const WithError: Story = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" errorMessage="This field is required" />
  </FormWrapper>
)

export const Disabled: Story = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" isDisabled />
  </FormWrapper>
)

export const CustomRows: Story = () => (
  <FormWrapper>
    <TextAreaField name="description" label="Description" rows={8} />
  </FormWrapper>
)

export const WithDefaultValue: Story = () => (
  <FormWrapper
    defaultValues={{
      description: 'This is the default text',
    }}
  >
    <TextAreaField name="description" label="Description" />
  </FormWrapper>
)
