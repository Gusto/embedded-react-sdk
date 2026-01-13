import { fn } from '@storybook/test'
import { SubmitDone } from './SubmitDone'
import { ContractorSubmit } from './Submit'

export default {
  title: 'Domain/Contractor/Submit',
}

export const ContractorSubmitDefault = () => {
  return <ContractorSubmit contractorId="123" onEvent={fn().mockName('Domain/Contractor/Submit')} />
}

export const ContractorSubmitDone = () => {
  return <SubmitDone onDone={fn().mockName('Domain/Contractor/SubmitDone')} />
}
