import { action } from '@ladle/react'
import { Industry, IndustrySelect } from './Industry'

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
