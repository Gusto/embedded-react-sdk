import { createCompoundContext } from '@/components/Base'

type FederalTaxesContextType = {
  isPending: boolean
}

const [useFederalTaxes, FederalTaxesProvider] =
  createCompoundContext<FederalTaxesContextType>('FederalTaxesContext')
export { useFederalTaxes, FederalTaxesProvider }
