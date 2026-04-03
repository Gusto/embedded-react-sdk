import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useEmployeeList } from './useEmployeeList'
import { server } from '@/test/mocks/server'
import { handleGetCompanyEmployees, handleUpdateEmployeeOnboardingStatus } from '@/test/mocks/apis/employees'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { EmployeeOnboardingStatus } from '@/shared/constants'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      resolvedLanguage: 'en',
      addResourceBundle: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <GustoTestProvider>{children}</GustoTestProvider>
}

const mockEmployees = [
  {
    uuid: 'employee-1',
    first_name: 'John',
    last_name: 'Doe',
    onboarded: true,
    onboarding_status: 'onboarding_completed',
  },
  {
    uuid: 'employee-2',
    first_name: 'Jane',
    last_name: 'Smith',
    onboarded: false,
    onboarding_status: 'admin_onboarding_incomplete',
  },
]

describe('useEmployeeList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()

    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json(mockEmployees, {
          headers: {
            'x-total-pages': '1',
            'x-total-count': '2',
            'x-page': '1',
            'x-per-page': '25',
          },
        }),
      ),
    )
  })

  describe('Initial State', () => {
    it('should start in loading state', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should fetch and return employees when loaded', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.employees).toHaveLength(2)
        expect(result.current.employees[0]?.uuid).toBe('employee-1')
        expect(result.current.employees[1]?.uuid).toBe('employee-2')
      }
    })

    it('should initialize pagination properties', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.pagination.currentPage).toBe(1)
        expect(result.current.pagination.totalPages).toBe(1)
        expect(result.current.pagination.totalCount).toBe(2)
        expect(result.current.pagination.itemsPerPage).toBe(5)
      }
    })

    it('should initialize status with isPending false', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.status.isPending).toBe(false)
      }
    })
  })

  describe('Terminated Employees', () => {
    it('should fetch terminated employees when getTerminatedEmployees is true', async () => {
      let requestUrl = ''
      server.use(
        handleGetCompanyEmployees(({ request }) => {
          requestUrl = request.url
          return HttpResponse.json([], {
            headers: {
              'x-total-pages': '1',
              'x-total-count': '0',
              'x-page': '1',
              'x-per-page': '25',
            },
          })
        }),
      )

      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123', getTerminatedEmployees: true }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(requestUrl).toContain('terminated=true')
    })

    it('should include terminated parameter as false when getTerminatedEmployees is false', async () => {
      let requestUrl = ''
      server.use(
        handleGetCompanyEmployees(({ request }) => {
          requestUrl = request.url
          return HttpResponse.json(mockEmployees, {
            headers: {
              'x-total-pages': '1',
              'x-total-count': '2',
              'x-page': '1',
              'x-per-page': '25',
            },
          })
        }),
      )

      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123', getTerminatedEmployees: false }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(requestUrl).toContain('terminated=false')
    })
  })

  describe('Actions', () => {
    describe('onDelete', () => {
      it('should delete an employee successfully', async () => {
        const { result } = renderHook(
          () => useEmployeeList({ companyId: 'company-123' }),
          {
            wrapper: TestWrapper,
          },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        if (!result.current.isLoading) {
          const currentResult = result.current
          await act(async () => {
            await currentResult.actions.onDelete('employee-1')
          })
          expect(result.current.status.isPending).toBe(false)
        }
      })
    })

    describe('onReview', () => {
      it('should update onboarding status to awaiting admin review', async () => {
        let capturedRequestBody: unknown

        server.use(
          handleUpdateEmployeeOnboardingStatus(async ({ request }) => {
            capturedRequestBody = await request.json()
            return HttpResponse.json({
              onboarding_status: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
            })
          }),
        )

        const { result } = renderHook(
          () => useEmployeeList({ companyId: 'company-123' }),
          {
            wrapper: TestWrapper,
          },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        if (!result.current.isLoading) {
          const currentResult = result.current
          await act(async () => {
            await currentResult.actions.onReview('employee-1')
          })

          expect(capturedRequestBody).toEqual({
            onboarding_status: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
          })
        }
      })
    })

    describe('onCancelSelfOnboarding', () => {
      it('should update onboarding status to admin onboarding incomplete', async () => {
        let capturedRequestBody: unknown

        server.use(
          handleUpdateEmployeeOnboardingStatus(async ({ request }) => {
            capturedRequestBody = await request.json()
            return HttpResponse.json({
              onboarding_status: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
            })
          }),
        )

        const { result } = renderHook(
          () => useEmployeeList({ companyId: 'company-123' }),
          {
            wrapper: TestWrapper,
          },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        if (!result.current.isLoading) {
          const currentResult = result.current
          await act(async () => {
            await currentResult.actions.onCancelSelfOnboarding('employee-1')
          })

          expect(capturedRequestBody).toEqual({
            onboarding_status: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          })
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should provide error handling interface', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.errorHandling).toBeDefined()
      expect(result.current.errorHandling.errors).toEqual([])
      expect(result.current.errorHandling.retryQueries).toBeDefined()
      expect(result.current.errorHandling.clearSubmitError).toBeDefined()
    })
  })

  describe('isFetching', () => {
    it('should track fetching state independently from loading state', async () => {
      const { result } = renderHook(
        () => useEmployeeList({ companyId: 'company-123' }),
        {
          wrapper: TestWrapper,
        },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.isFetching).toBe(false)
      }
    })
  })
})
