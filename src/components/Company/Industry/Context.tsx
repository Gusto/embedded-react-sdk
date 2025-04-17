import { createCompoundContext } from '@/components/Base'
import type { ComboBoxOption } from '@/types/UI/ComboBox'

const [useIndustryItems, IndustryItemsProvider] = createCompoundContext('IndustryItems', {
  items: [] as ComboBoxOption[],
})

const [useIndustryApiState, IndustryApiStateProvider] = createCompoundContext('IndustryApi', {
  isPending: false,
})

export { IndustryApiStateProvider, IndustryItemsProvider, useIndustryItems, useIndustryApiState }
