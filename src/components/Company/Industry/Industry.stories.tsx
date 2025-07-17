import { action } from '@ladle/react'
import { IndustrySelect } from './IndustrySelect'
import { Actions } from './Actions'
import { Head } from './Head'
import { Edit } from './Edit'

// Adding a meta object for title
export default {
  title: 'Domain/Company/Industry', // Creates nesting structure for domain-specific components
}

export const Select = () => {
  return <IndustrySelect onValid={action('industrySelect/submit') as () => Promise<void>} />
}

export const WithCustomization = () => {
  return (
    <IndustrySelect onValid={action('industrySelect/submit') as () => Promise<void>}>
      <Actions />
      <Head />
      <Edit />
    </IndustrySelect>
  )
}
