import { describe, expect, it } from '@jest/globals'

import { GustoClient } from '../../src/api/client'
import { COMPANY_LOCATION_FORM_PAYLOAD } from '../mocks/fixtures/company_location'
import { handleResponse } from '../../src/api/queries/helpers'

describe('SDK requests', () => {
  describe('getCompanyEmployees', () => {
    it('returns an array of employees', async () => {
      const client = new GustoClient()

      const { data } = await client.getCompanyEmployees('some-company-uuid')

      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      if (data && data[0]) {
        expect(data[0].first_name).toBe('Maximus')
      }
    })
  })

  describe('getEmployee', () => {
    it('returns an employee', async () => {
      const client = new GustoClient()

      const { data } = await client.getEmployee('some-uuid')

      expect(data!.uuid).toBe('some-uuid')
      expect(data!.first_name).toBe('Lucy')
      expect(data!.last_name).toBe('MacLean')
    })
  })

  describe('deleteEmployee', () => {
    it('deletes an eployee', async () => {
      const client = new GustoClient()
      const { response } = await client.deleteEmployee('employee-uuid')
      expect(response.status).toBe(204)
    })
  })

  describe('getTokenInfo', () => {
    it('returns information about a token', async () => {
      const client = new GustoClient()

      const { data } = await client.getTokenInfo()

      expect(data!.resource!.type).toBe('Company')
    })
  })

  describe('createEmployee', () => {
    it('creates an employee', async () => {
      const client = new GustoClient()
      const first_name = 'Bobby'
      const last_name = 'Appleseed'

      const data = await client.createEmployee('company-uuid', { first_name, last_name })

      expect(data!.uuid).toBe('employee-uuid')
      expect(data!.first_name).toBe(first_name)
      expect(data!.last_name).toBe(last_name)
    })
  })

  describe('updateEmployee', () => {
    it('updates an employee', async () => {
      const client = new GustoClient()
      const employee_uuid = 'employee-uuid'
      const first_name = 'Suzie'
      const last_name = 'Q'

      const data = await client.updateEmployee(employee_uuid, {
        version: 'version',
        first_name,
        last_name,
      })
      expect(data!.uuid).toBe(employee_uuid)
    })
  })

  describe('Employee Home Addresses', () => {
    describe('createEmployeeAddress', () => {
      it('creates a home address for an employee', async () => {
        const client = new GustoClient()
        const employee_uuid = 'employee-uuid'
        const address = {
          street_1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
        }

        const data = await client.createEmployeeHomeAddress(employee_uuid, address)

        expect(data!.uuid).toBe('address-uuid')
        expect(data!.street_1).toBe(address.street_1)
        expect(data!.city).toBe(address.city)
        expect(data!.state).toBe(address.state)
        expect(data!.zip).toBe(address.zip)
      })
    })

    describe('getEmployeeHomeAddress', () => {
      it("returns an employee's home address", async () => {
        const client = new GustoClient()
        const { data } = await client.getEmployeeHomeAddress('address-uuid')

        expect(data!.uuid).toBe('address-uuid')
        expect(data!.version).toBe('1.0')
        expect(data!.street_1).toBe('123 Main St')
      })
    })

    describe('getEmployeeAddresses', () => {
      it("returns an employee's home addresses", async () => {
        const client = new GustoClient()
        const { data } = await client.getEmployeeHomeAddresses('employee-uuid')
        const firstAddress = data![0]

        expect(firstAddress!.uuid).toBe('address-uuid')
        expect(firstAddress!.version).toBe('1.0')
        expect(firstAddress!.street_1).toBe('123 Main St')
      })
    })

    describe('deleteEmployeeHomeAddress', () => {
      it("delete's an employee's home address", async () => {
        const client = new GustoClient()
        const { response } = await client.deleteEmployeeHomeAddress('address-uuid')
        expect(response.status).toBe(204)
      })
    })

    describe('updateEmployeeHomeAddress', () => {
      it('updates a home address for an employee', async () => {
        const client = new GustoClient()
        const address_uuid = 'address-uuid'
        const updatedAddress = {
          version: 'v2',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
        }

        const data = await client.updateEmployeeHomeAddress(address_uuid, updatedAddress)

        expect(data!.version).toBe('2.0')
        expect(data!.uuid).toBe(address_uuid)
        expect(data!.city).toBe(updatedAddress.city)
        expect(data!.state).toBe(updatedAddress.state)
        expect(data!.zip).toBe(updatedAddress.zip)
      })
    })

    describe('Jobs and Compensations', () => {
      describe('employeeCreateCompensations', () => {
        it('creates compensation for an employee', async () => {
          const client = new GustoClient()
          const job_uuid = 'job-uuid'
          const payload = {
            payment_unit: 'Week' as const,
            flsa_status: 'Exempt' as const,
            rate: '60000.00',
            effective_date: '2024-12-02',
            adjust_for_minimum_wage: false,
          }

          const { data } = await client.createEmployeeCompensation(job_uuid, payload)

          expect(data!.uuid).toBe('12345678-1234-5678-1234-567812345678')
          expect(data!.job_uuid).toBe('job-uuid')
          expect(data!.version).toBe('1.0')
          expect(data!.rate).toBe(payload.rate)
          expect(data!.payment_unit).toBe(payload.payment_unit)
          expect(data!.effective_date).toBe(payload.effective_date)
        })
      })
    })
  })
  describe('Employee Work Addresses', () => {
    describe('createEmployeeAddress', () => {
      it('creates a work address for an employee', async () => {
        const client = new GustoClient()
        const employee_uuid = 'employee-uuid'
        const address = {
          location_uuid: '6a119be7-b4b0-4e27-aaa0-89d5f2524635',
          effective_date: '2023-05-15',
        }

        const data = await client.createEmployeeWorkAddress(employee_uuid, address)

        expect(data!.uuid).toBe('6a119be7-b4b0-4e27-aaa0-89d5f2524635')
      })
    })

    describe('getEmployeeWorkAddress', () => {
      it("returns an employee's work address", async () => {
        const client = new GustoClient()
        const data = await client.getEmployeeWorkAddress('address-uuid').then(handleResponse)
        expect(data!.uuid).toBe('address-uuid')
        expect(data!.version).toBe('1.0')
      })
    })

    describe('getEmployeeAddresses', () => {
      it("returns an employee's work addresses", async () => {
        const client = new GustoClient()
        const data = await client.getEmployeeWorkAddresses('employee-uuid').then(handleResponse)
        const firstAddress = data![0]

        expect(firstAddress!.uuid).toBe('address-uuid')
        expect(firstAddress!.version).toBe('1.0')
      })
    })

    describe('deleteEmployeeWorkAddress', () => {
      it("delete's an employee's work address", async () => {
        const client = new GustoClient()
        const { response } = await client.deleteEmployeeWorkAddress('address-uuid')
        expect(response.status).toBe(204)
      })
    })

    describe('updateEmployeeWorkAddress', () => {
      it('updates a work address for an employee', async () => {
        const client = new GustoClient()
        const address_uuid = 'address-uuid'
        const updatedAddress = {
          version: 'v2',
        }

        const data = await client.updateEmployeeWorkAddress(address_uuid, updatedAddress)

        expect(data!.version).toBe('2.0')
        expect(data!.uuid).toBe(address_uuid)
      })
    })
  })

  describe('Company Locations', () => {
    describe('createCompanyLocation', () => {
      it('creates a company location', async () => {
        const client = new GustoClient()
        const company_id = 'company_uuid'
        const location_payload = COMPANY_LOCATION_FORM_PAYLOAD

        const data = await client.createCompanyLocation(company_id, location_payload)
        expect(data!.uuid).toBe('location_uuid')
        expect(data!.version).toBe('1.0')
        expect(data!.street_1).toBe(location_payload.street_1)
        expect(data!.city).toBe(location_payload.city)
        expect(data!.state).toBe(location_payload.state)
        expect(data!.zip).toBe(location_payload.zip)
        expect(data!.country).toBe(location_payload.country)
        expect(data!.mailing_address).toBe(location_payload.mailing_address)
        expect(data!.filing_address).toBe(location_payload.filing_address)
      })
    })

    describe('getCompanyLocations', () => {
      it("returns a company's locations", async () => {
        const client = new GustoClient()
        const data = await client.getCompanyLocations('company-uuid')
        const firstAddress = data![0]

        expect(firstAddress!.uuid).toBe('123e4567-e89b-12d3-a456-426614174000')
        expect(firstAddress!.version).toBe('1.0')
        expect(firstAddress!.street_1).toBe('123 Main St')
        expect(firstAddress!.city).toBe('Anytown')
        expect(firstAddress!.state).toBe('ABC')
        expect(firstAddress!.zip).toBe('12345')
      })
    })

    describe('updateCompanyLocation', () => {
      it('updates a company location', async () => {
        const client = new GustoClient()
        const address_id = 'company_uuid'
        const location_payload = { ...COMPANY_LOCATION_FORM_PAYLOAD, version: '1.0' }

        const { data } = await client.updateCompanyLocation(address_id, location_payload)

        expect(data!.uuid).toBe('location_uuid')
        expect(data!.version).toBe('1.0')
        expect(data!.street_1).toBe(location_payload.street_1)
        expect(data!.city).toBe(location_payload.city)
        expect(data!.state).toBe(location_payload.state)
        expect(data!.zip).toBe(location_payload.zip)
        expect(data!.country).toBe(location_payload.country)
        expect(data!.mailing_address).toBe(location_payload.mailing_address)
        expect(data!.filing_address).toBe(location_payload.filing_address)
      })
    })
  })
})
