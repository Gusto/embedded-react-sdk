import { action } from '@ladle/react'
import { IndustrySelect } from './IndustrySelect'
import { Industry } from './Industry'

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
      <Industry.Actions />
      <Industry.Head />
      <Industry.Edit />
    </IndustrySelect>
  )
}
