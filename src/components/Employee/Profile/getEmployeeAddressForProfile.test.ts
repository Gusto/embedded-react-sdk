import { describe, expect, it } from 'vitest'
import { getEmployeeAddressForProfile } from './getEmployeeAddressForProfile'
import { type EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'

describe('getEmployeeAddressForProfile', () => {
  it('should return undefined when no addresses are provided', () => {
    expect(getEmployeeAddressForProfile([])).toBeUndefined()
  })

  it('should return the only address when there is exactly one', () => {
    const address: EmployeeAddress = {
      active: false,
      uuid: '1',
      employeeUuid: '1',
      street1: '123 Main St',
    }

    expect(getEmployeeAddressForProfile([address])).toBe(address)
  })

  it('should return the active address when multiple addresses exist', () => {
    const inactiveAddress: EmployeeAddress = {
      active: false,
      uuid: '1',
      employeeUuid: '1',
      street1: '123 Main St',
    }
    const anotherInactiveAddress: EmployeeAddress = {
      active: false,
      uuid: '2',
      employeeUuid: '1',
      street1: '123 Main St',
    }
    const activeAddress: EmployeeAddress = {
      active: true,
      uuid: '3',
      employeeUuid: '1',
      street1: '123 Main St',
    }

    expect(
      getEmployeeAddressForProfile([inactiveAddress, anotherInactiveAddress, activeAddress]),
    ).toBe(activeAddress)
  })

  it('should return the first address when multiple inactive addresses exist', () => {
    const firstAddress: EmployeeAddress = {
      active: false,
      uuid: '1',
      employeeUuid: '1',
      street1: '123 Main St',
    }
    const secondAddress: EmployeeAddress = {
      active: false,
      uuid: '2',
      employeeUuid: '1',
      street1: '123 Main St',
    }

    expect(getEmployeeAddressForProfile([firstAddress, secondAddress])).toBe(firstAddress)
  })
})
