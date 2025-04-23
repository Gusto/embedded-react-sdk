import { type EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'

export const getEmployeeAddressForProfile = (homeAddresses?: EmployeeAddress[]) => {
  if (!homeAddresses || homeAddresses.length === 0) {
    return undefined
  }

  // Either return the active address or the first address if there is no active address
  // The first address will either be the only address or the one with the earliest effective date
  // since the backend returns them sorted by effective date
  return homeAddresses.find(address => address.active) ?? homeAddresses[0]
}
