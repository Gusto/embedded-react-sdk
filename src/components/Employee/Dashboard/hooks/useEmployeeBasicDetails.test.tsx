import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useEmployeeBasicDetails } from './useEmployeeBasicDetails'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'

describe('useEmployeeBasicDetails', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading with the work-address flag true and resolves to populated data', async () => {
    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.status.isWorkAddressLoading).toBe(true)
    expect(result.current.data.currentWorkAddress).toBeUndefined()

    await waitFor(() => {
      expect(result.current.status.isWorkAddressLoading).toBe(false)
    })

    expect(result.current.data.currentWorkAddress).toBeDefined()
  })

  it('picks the active work address out of the returned list', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json([
          {
            uuid: 'work-inactive',
            version: '1',
            street_1: '1 Old Way',
            city: 'Oldville',
            state: 'CA',
            zip: '90100',
            active: false,
          },
          {
            uuid: 'work-active',
            version: '1',
            street_1: '500 New Ln',
            city: 'Newville',
            state: 'CA',
            zip: '90200',
            active: true,
          },
        ]),
      ),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isWorkAddressLoading).toBe(false)
    })

    expect(result.current.data.currentWorkAddress).toMatchObject({
      uuid: 'work-active',
      active: true,
    })
  })

  it('returns undefined currentWorkAddress when none in the list are active', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json([]),
      ),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isWorkAddressLoading).toBe(false)
    })

    expect(result.current.data.currentWorkAddress).toBeUndefined()
  })

  it('surfaces a work-address query failure through errorHandling.errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
