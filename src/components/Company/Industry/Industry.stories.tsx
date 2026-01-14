import { fn } from 'storybook/test'
import { IndustrySelect } from './IndustrySelect'
import { Actions } from './Actions'
import { Head } from './Head'
import { Edit } from './Edit'

export default {
  title: 'Domain/Company/Industry',
}

const submitAction = fn().mockName('industrySelect/submit')

export const Select = () => {
  return <IndustrySelect onValid={submitAction as () => Promise<void>} />
}

export const WithCustomization = () => {
  return (
    <IndustrySelect onValid={submitAction as () => Promise<void>}>
      <Actions />
      <Head />
      <Edit />
    </IndustrySelect>
  )
}
