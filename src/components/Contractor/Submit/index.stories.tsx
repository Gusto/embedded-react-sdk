import { action } from '@ladle/react'
import { SubmitDone } from './SubmitDone'
import { ContractorSubmit } from './'

export default {
  title: 'Domain/Contractor/Submit',
}

export const ContractorSubmitDefault = () => {
  return <ContractorSubmit onSubmit={action('Domain/Contractor/Submit')} />
}

export const ContractorSubmitDone = () => {
  return <SubmitDone onDone={action('Domain/Contractor/SubmitDone')} />
}
