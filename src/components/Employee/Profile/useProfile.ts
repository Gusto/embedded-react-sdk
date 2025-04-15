import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { createCompoundContext } from '@/components/Base'

//Interface for context passed down to component slots
type ProfileContextType = {
  companyLocations: Location[]
  workAddresses?: EmployeeWorkAddress[]
  employee?: Employee
  isSelfOnboardingIntended?: boolean
  isPending: boolean
  isAdmin: boolean
  handleCancel: () => void
  isSelfOnboardingEnabled: boolean
}

const [useProfile, ProfileProvider] = createCompoundContext<ProfileContextType>('ProfileContext')
export { useProfile, ProfileProvider }
