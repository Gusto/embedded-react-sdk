import { Schemas } from '@/types'
import { createCompoundContext } from '@/components/Base/createCompoundContext'

export type MODE = 'ADD' | 'LIST' | 'SPLIT' | 'INITIAL'

export type PaymentMethodContextType = {
  bankAccounts: Schemas['Employee-Bank-Account'][]
  isPending: boolean
  watchedType?: string
  mode: MODE
  paymentMethod: Schemas['Employee-Payment-Method']
  handleAdd: () => void
  handleSplit: () => void
  handleCancel: () => void
  handleDelete: (uuid: string) => void
}

export const [usePaymentMethod, PaymentMethodProvider] =
  createCompoundContext<PaymentMethodContextType>('PaymentMethodContext')
