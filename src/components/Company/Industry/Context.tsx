import { createCompoundContext } from '@/components/Base'
import type { ComboBoxItem } from '@/components/Common'

const [useIndustryItems, IndustryItemsProvider] = createCompoundContext('IndustryItems', {
  items: [] as ComboBoxItem[],
})

const [useIndustryApiState, IndustryApiStateProvider] = createCompoundContext('IndustryApi', {
  isPending: false,
})

export { IndustryApiStateProvider, IndustryItemsProvider, useIndustryItems, useIndustryApiState }
