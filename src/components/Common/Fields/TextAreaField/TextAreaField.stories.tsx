import type { StoryObj, Meta } from '@ladle/react'
import { FormProvider, useForm } from 'react-hook-form'
import { TextAreaField } from './TextAreaField'

const meta = {
  title: 'Fields/TextAreaField',
  component: TextAreaField,
} satisfies Meta<typeof TextAreaField>

export default meta

type Story = StoryObj<typeof meta>

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

export const Default: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField name="description" label="Description" />
    </Wrapper>
  ),
}

export const WithPlaceholder: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField
        name="description"
        label="Description"
        placeholder="Enter your description here..."
      />
    </Wrapper>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField
        name="description"
        label="Description"
        description="Please provide a detailed description"
      />
    </Wrapper>
  ),
}

export const Required: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField name="description" label="Description" isRequired />
    </Wrapper>
  ),
}

export const WithError: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField
        name="description"
        label="Description"
        errorMessage="This field is required"
      />
    </Wrapper>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField name="description" label="Description" isDisabled />
    </Wrapper>
  ),
}

export const CustomRows: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField name="description" label="Description" rows={8} />
    </Wrapper>
  ),
}

export const WithDefaultValue: Story = {
  render: () => (
    <Wrapper>
      <TextAreaField
        name="description"
        label="Description"
        defaultValue="This is the default text"
      />
    </Wrapper>
  ),
}

