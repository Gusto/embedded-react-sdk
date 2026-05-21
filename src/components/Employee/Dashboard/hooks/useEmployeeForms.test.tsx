import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useEmployeeForms } from './useEmployeeForms'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useEmployeeForms', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading with an empty list and resolves to the API response', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    const { result } = renderHook(() => useEmployeeForms({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.status.isFormsLoading).toBe(true)
    expect(result.current.data.formList).toEqual([])

    await waitFor(() => {
      expect(result.current.status.isFormsLoading).toBe(false)
    })

    expect(result.current.data.formList).toMatchObject([
      { uuid: 'i9-form-123', title: 'Form I-9', requiresSigning: true },
    ])
  })

  it('returns an empty list when the employee has no forms', async () => {
    const { result } = renderHook(() => useEmployeeForms({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isFormsLoading).toBe(false)
    })

    expect(result.current.data.formList).toEqual([])
  })
})
