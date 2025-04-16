import { type Signatory } from '@gusto/embedded-api/models/components/signatory'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

type InviteSignatoryContextType = {
  isPending: boolean
}

export type InviteSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title'> & {
    confirmEmail: string
  }
>

const [useInviteSignatory, InviteSignatoryProvider] =
  createCompoundContext<InviteSignatoryContextType>('InviteSignatoryContext')

export { useInviteSignatory, InviteSignatoryProvider }
