import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { Schemas } from '@/types'

//Interface for context passed down to component slots
export type ProfileContextType = {
  companyLocations: Schemas['Location'][]
  employee?: Schemas['Employee']
  isPending: boolean
  handleCancel: () => void
}

export const [useProfile, ProfileProvider] =
  createCompoundContext<ProfileContextType>('ProfileContext')
