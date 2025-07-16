import { action } from '@ladle/react'
import { SubmitDone } from './submitDone'
import { ContractorSubmit } from './'

export default {
  title: 'Domain/Contractor/Submit',
}

export function ContractorSubmitDefault() {
  return <ContractorSubmit onSubmit={action('Domain/Contractor/Submit')} />
}

export function ContractorSubmitDone() {
  return <SubmitDone onDone={action('Domain/Contractor/SubmitDone')} />
}
