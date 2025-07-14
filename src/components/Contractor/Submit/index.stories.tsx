import { action } from '@ladle/react'
import { ContractorSubmit } from './'

export default {
  title: 'Domain/Contractor/Submit',
}

export function ContractorSubmitDefault() {
  return <ContractorSubmit onSubmit={action('Domain/Contractor/Submit')} />
}
