import { FieldCaption } from './FieldCaption'

// Adding a meta object for title
export default {
  title: 'UI/Form/Layout/FieldCaption', // Updated to be under UI/Form instead of top-level Form
}

export const Default = () => <FieldCaption htmlFor="input-field">Field Label</FieldCaption>

export const Required = () => (
  <FieldCaption htmlFor="required-field" isRequired>
    Required Field
  </FieldCaption>
)
