import { type Signatory } from '@gusto/embedded-api-v-2026-06-15/models/components/signatory'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

type InviteSignatoryContextType = {
  isPending: boolean
}

/**
 * Default values for the invite signatory form fields: `firstName`, `lastName`, `email`,
 * `confirmEmail`, and `title`. At least one field is required.
 *
 * @public
 */
export type InviteSignatoryDefaultValues = RequireAtLeastOne<
  Pick<Signatory, 'firstName' | 'lastName' | 'email' | 'title'> & {
    confirmEmail: string
  }
>

const [useInviteSignatory, InviteSignatoryProvider] =
  createCompoundContext<InviteSignatoryContextType>('InviteSignatoryContext')

export { useInviteSignatory, InviteSignatoryProvider }
