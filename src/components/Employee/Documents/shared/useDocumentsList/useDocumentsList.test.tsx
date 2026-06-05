import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useDocumentsList } from './useDocumentsList'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useDocumentsList', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('returns the loading branch while the forms query is pending', () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    const { result } = renderHook(() => useDocumentsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])
  })

  it('resolves to the ready branch with the loaded forms', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    const { result } = renderHook(() => useDocumentsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) throw new Error('expected ready branch')
    expect(result.current.data.forms).toMatchObject([
      { uuid: 'i9-form-123', title: 'Form I-9', requiresSigning: true },
    ])
    expect(result.current.status).toMatchObject({ isFetching: false })
  })

  it('returns an empty list when the employee has no forms', async () => {
    const { result } = renderHook(() => useDocumentsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) throw new Error('expected ready branch')
    expect(result.current.data.forms).toEqual([])
  })

  it('surfaces query errors through errorHandling', async () => {
    server.use(handleGetEmployeeForms(() => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(() => useDocumentsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
