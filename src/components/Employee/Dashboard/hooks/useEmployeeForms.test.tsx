import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useEmployeeForms } from './useEmployeeForms'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { requireNotLoading } from '@/test-utils/assertions'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GustoTestProvider>
    <React.Suspense fallback={null}>{children}</React.Suspense>
  </GustoTestProvider>
)

describe('useEmployeeForms', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('returns the list of forms from the API', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))

    const { result } = renderHook(() => useEmployeeForms({ employeeId: 'employee-123' }), {
      wrapper,
    })

    const loadedResult = await waitFor(() => requireNotLoading(result.current))

    expect(loadedResult.data.formList).toMatchObject([
      { uuid: 'i9-form-123', title: 'Form I-9', requiresSigning: true },
    ])
  })

  it('returns an empty list when the employee has no forms', async () => {
    const { result } = renderHook(() => useEmployeeForms({ employeeId: 'employee-123' }), {
      wrapper,
    })

    const loadedResult = await waitFor(() => requireNotLoading(result.current))

    expect(loadedResult.data.formList).toEqual([])
  })
})
