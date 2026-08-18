import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import { QuestionInput } from './TaxInputs'

export default {
  title: 'UI/Form/Fields/TaxInputs',
}

const einSuffixRequirement: TaxRequirement = {
  key: 'einSuffix',
  label: 'EIN suffix',
  description: 'Some tax agencies use an account number that is your federal EIN plus two digits.',
  value: null,
  metadata: {
    type: 'account_number',
    mask: '##',
    prefix: 'XXXXX1234',
  },
}

const uiaAccountNumberRequirement: TaxRequirement = {
  key: 'uiaAccountNumber',
  label: 'UIA Account Number',
  description: 'No prefix on this requirement -- matches most account_number requirements today.',
  value: null,
  metadata: {
    type: 'account_number',
    mask: '###-####-#',
    prefix: null,
  },
}

// SDK-1143: account_number requirements with metadata.prefix should render it as a
// fixed prefix ahead of the masked value, matching Rails' TaxRequirements::InputBuilder.
export const AccountNumberWithPrefix = () => (
  <FormWrapper>
    <QuestionInput requirement={einSuffixRequirement} questionType="account_number" />
  </FormWrapper>
)

export const AccountNumberWithoutPrefix = () => (
  <FormWrapper>
    <QuestionInput requirement={uiaAccountNumberRequirement} questionType="account_number" />
  </FormWrapper>
)
