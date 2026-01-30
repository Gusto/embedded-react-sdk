import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { FileInputField } from './FileInputField'

export default {
  title: 'UI/Form/Fields/FileInputField',
}

export const Default = () => {
  return (
    <FormWrapper>
      <FileInputField name="document" label="Upload document" />
    </FormWrapper>
  )
}

export const Required = () => {
  return (
    <FormWrapper>
      <FileInputField
        name="document"
        label="Upload document"
        isRequired
        errorMessage="Document is required"
      />
    </FormWrapper>
  )
}

export const WithAcceptedTypes = () => {
  return (
    <FormWrapper>
      <FileInputField
        name="document"
        label="Upload document"
        accept={['image/jpeg', 'image/png', 'application/pdf']}
      />
    </FormWrapper>
  )
}
