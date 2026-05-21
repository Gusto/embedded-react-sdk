import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useEmployeeBasicDetails } from './useEmployeeBasicDetails'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployee } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'

describe('useEmployeeBasicDetails', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading with all three per-query flags true and resolves to populated data', async () => {
    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.status.isEmployeeLoading).toBe(true)
    expect(result.current.status.isHomeAddressLoading).toBe(true)
    expect(result.current.status.isWorkAddressLoading).toBe(true)
    expect(result.current.data.employee).toBeUndefined()
    expect(result.current.data.currentHomeAddress).toBeUndefined()
    expect(result.current.data.currentWorkAddress).toBeUndefined()

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
      expect(result.current.status.isHomeAddressLoading).toBe(false)
      expect(result.current.status.isWorkAddressLoading).toBe(false)
    })

    expect(result.current.data.employee).toMatchObject({
      firstName: 'Isom',
      lastName: 'Jaskolski',
    })
    expect(result.current.data.currentHomeAddress).toBeDefined()
    expect(result.current.data.currentWorkAddress).toBeDefined()
  })

  it('picks the active home address out of the returned list', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json([
          {
            uuid: 'home-inactive',
            version: '1',
            street_1: '1 Old St',
            city: 'Oldtown',
            state: 'CA',
            zip: '90001',
            country: 'USA',
            active: false,
          },
          {
            uuid: 'home-active',
            version: '1',
            street_1: '2 Current Ave',
            city: 'Newtown',
            state: 'CA',
            zip: '90002',
            country: 'USA',
            active: true,
          },
        ]),
      ),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isHomeAddressLoading).toBe(false)
    })

    expect(result.current.data.currentHomeAddress).toMatchObject({
      uuid: 'home-active',
      active: true,
    })
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

  it('returns undefined active addresses when none in the list are active', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json([]),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json([]),
      ),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isHomeAddressLoading).toBe(false)
      expect(result.current.status.isWorkAddressLoading).toBe(false)
    })

    expect(result.current.data.currentHomeAddress).toBeUndefined()
    expect(result.current.data.currentWorkAddress).toBeUndefined()
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetEmployee(() =>
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

    // Employee query has settled with an error; the per-section flag
    // is no longer "loading", so the consuming view will fall through
    // its skeleton branch instead of showing one forever.
    expect(result.current.status.isEmployeeLoading).toBe(false)
    expect(result.current.data.employee).toBeUndefined()
  })

  it('does not include `?include=all_compensations` in the employee fetch', async () => {
    let employeeRequestUrl: string | null = null
    server.use(
      handleGetEmployee(({ request }) => {
        employeeRequestUrl = request.url
        return HttpResponse.json({
          uuid: 'employee-123',
          first_name: 'Isom',
          last_name: 'Jaskolski',
          jobs: [],
        })
      }),
    )

    const { result } = renderHook(() => useEmployeeBasicDetails({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
    })

    expect(employeeRequestUrl).not.toBeNull()
    expect(employeeRequestUrl).not.toContain('all_compensations')
  })
})
