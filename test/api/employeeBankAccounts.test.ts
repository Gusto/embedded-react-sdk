import { describe, expect, it } from '@jest/globals'
import { GustoClient } from '../../src/api/client'

describe('SDK: Employee Bank Accounts requests', () => {
  describe('getEmployeeBankAccounts', () => {
    it('returns an array of employee bank accounts', async () => {
      const client = new GustoClient()

      const { data } = await client.getEmployeeBankAccounts('employee_id')
      expect(data).toHaveLength(1)
      if (data && data.length > 0) {
        if (data[0]) {
          expect(data[0].employee_uuid).toBe('f621c2cc-c89e-414a-b401-3f5d787f1c17')
          expect(data[0].hidden_account_number).toBe('XXXX0000')
        }
      }
    })
  })

  describe('createEmployeeBankAccount', () => {
    it('creates a bank account', async () => {
      const client = new GustoClient()

      const data = await client.createEmployeeBankAccount('employee-uuid', {
        account_type: 'Savings',
        name: 'Chase',
        routing_number: '123456789',
        account_number: '1112224568',
      })
      expect(data!.uuid).toBeDefined()
      expect(data!.routing_number).toBe('123456789')
    })
  })

  // describe('deleteEmployeeBankAccount', () => {
  //   it('deletes an eployee bank account', async () => {
  //     const client = new GustoClient();
  //     const response = await client.deleteEmployeeBankAccount(
  //       'employee-uuid',
  //       'bank-account-id',
  //     );
  //     expect(response.status).toBe(204);
  //   });
  // });

  describe('getEmployeePaymentMethod', () => {
    it('returns an employee payment method', async () => {
      const client = new GustoClient()

      const { data } = await client.getEmployeePaymentMethod('employee_id')
      expect(data!.type).toBe('Direct Deposit')
      expect(data!.splits).toHaveLength(1)
    })
  })
  describe('updateEmployeePaymentMethod', () => {
    it('updates an employee payment method', async () => {
      const client = new GustoClient()

      const data = await client.updateEmployeePaymentMethod('employee_id', {
        version: '123',
        type: 'Check',
      })
      expect(data!.type).toBe('Check')
      expect(data!.splits).toHaveLength(1)
    })
  })
})
