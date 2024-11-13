import { useContext } from 'react'
import { GustoApiContext } from './gustoApiContext'

export const useGustoApi = () => {
  const context = useContext(GustoApiContext)
  if (!context) throw Error('useGustoApi can only be used inside GustoApiProvider.')
  return context
}
