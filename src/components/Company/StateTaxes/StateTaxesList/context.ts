import type { ResponseBody } from '@gusto/embedded-api/models/operations/getv1companiescompanyuuidtaxrequirements'
import { createCompoundContext } from '@/components/Base'

type StateTaxesListContextType = {
  isPending: boolean
  stateTaxeRequirements: ResponseBody[]
  handleContinue: () => void
  handleChange: (state: string) => void
}

const [useStateTaxesList, StateTaxesListProvider] =
  createCompoundContext<StateTaxesListContextType>('StateTaxesListContext')

export { useStateTaxesList, StateTaxesListProvider }
