import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useContractorList } from './useContractorList'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorsList,
  handleUpdateContractorOnboardingStatus,
  handleDeleteContractor,
  handleCancelContractorDismissal,
  handleCancelContractorRehire,
} from '@/test/mocks/apis/contractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { ContractorOnboardingStatus } from '@/shared/constants'

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

function contractorFixture(overrides: Record<string, unknown> = {}) {
  return {
    uuid: 'contractor-1',
    company_uuid: 'company-123',
    wage_type: 'Hourly',
    is_active: true,
    type: 'Individual',
    first_name: 'Jamie',
    last_name: 'Rivera',
    onboarded: true,
    onboarding_status: 'onboarding_completed',
    ...overrides,
  }
}

const mockContractors = [
  contractorFixture({ uuid: 'contractor-1' }),
  contractorFixture({
    uuid: 'contractor-2',
    onboarded: false,
    onboarding_status: 'admin_onboarding_incomplete',
  }),
]

function mockList(contractors: unknown[], totalCount = contractors.length) {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json(contractors, {
        headers: {
          'x-total-pages': '1',
          'x-total-count': String(totalCount),
        },
      }),
    ),
  )
}

describe('useContractorList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
    mockList(mockContractors)
  })

  describe('Initial state', () => {
    it('starts in loading state and resolves', async () => {
      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('fetches and returns contractors when loaded', async () => {
      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors).toHaveLength(2)
        expect(result.current.data.contractors[0]?.uuid).toBe('contractor-1')
        expect(result.current.data.contractors[1]?.uuid).toBe('contractor-2')
      }
    })

    it('initializes pagination properties', async () => {
      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.pagination.currentPage).toBe(1)
        expect(result.current.pagination.totalPages).toBe(1)
        expect(result.current.pagination.totalCount).toBe(2)
      }
    })
  })

  describe('Contractor type filtering', () => {
    it('requests onboarded_active=true for the active filter', async () => {
      let requestUrl = ''
      server.use(
        handleGetContractorsList(({ request }) => {
          requestUrl = request.url
          return HttpResponse.json([], {
            headers: { 'x-total-pages': '1', 'x-total-count': '0' },
          })
        }),
      )

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'active' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(requestUrl).toContain('onboarded_active=true')
    })

    it('requests onboarded=false for the onboarding filter', async () => {
      let requestUrl = ''
      server.use(
        handleGetContractorsList(({ request }) => {
          requestUrl = request.url
          return HttpResponse.json([], {
            headers: { 'x-total-pages': '1', 'x-total-count': '0' },
          })
        }),
      )

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'onboarding' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(requestUrl).toContain('onboarded=false')
    })

    it('requests terminated=true for the terminated filter', async () => {
      let requestUrl = ''
      server.use(
        handleGetContractorsList(({ request }) => {
          requestUrl = request.url
          return HttpResponse.json([], {
            headers: { 'x-total-pages': '1', 'x-total-count': '0' },
          })
        }),
      )

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'terminated' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(requestUrl).toContain('terminated=true')
    })
  })

  describe('allowedActions', () => {
    it.each([
      ['admin_onboarding_incomplete', ['edit', 'delete']],
      ['self_onboarding_not_invited', ['edit', 'delete']],
      ['self_onboarding_invited', ['cancel_self_onboarding', 'delete']],
      ['self_onboarding_started', ['cancel_self_onboarding', 'delete']],
      ['self_onboarding_review', ['edit', 'delete']],
    ])('unfiltered list: %s -> %j', async (onboardingStatus, expected) => {
      mockList([contractorFixture({ onboarding_status: onboardingStatus })])

      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual(expected)
      }
    })

    it("adds 'view' once onboarding is completed, under the onboarding filter", async () => {
      mockList([contractorFixture({ onboarding_status: 'onboarding_completed' })])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'onboarding' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual([
          'edit',
          'delete',
          'view',
        ])
      }
    })

    it('active filter: offers dismiss with no dismissal/rehire pending', async () => {
      mockList([contractorFixture({ dismissal_date: null, upcoming_employment: null })])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'active' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual(['view', 'dismiss'])
      }
    })

    it('active filter: offers cancel_dismissal when a dismissal is cancellable', async () => {
      mockList([
        contractorFixture({
          dismissal_date: '2026-08-01',
          dismissal_cancellation_eligible: true,
        }),
      ])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'active' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual([
          'view',
          'cancel_dismissal',
        ])
      }
    })

    it('active filter: offers cancel_rehire when a rehire is cancellable', async () => {
      mockList([
        contractorFixture({
          upcoming_employment: { start_date: '2026-09-01' },
          rehire_cancellation_eligible: true,
        }),
      ])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'active' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual([
          'view',
          'cancel_rehire',
        ])
      }
    })

    it('terminated filter: offers rehire when inactive with no pending dismissal/rehire', async () => {
      mockList([
        contractorFixture({
          is_active: false,
          dismissal_date: null,
          upcoming_employment: null,
        }),
      ])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'terminated' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual(['view', 'rehire'])
      }
    })

    it('terminated filter: offers cancel_dismissal when the dismissal is still cancellable', async () => {
      mockList([
        contractorFixture({
          is_active: false,
          upcoming_employment: null,
          dismissal_cancellation_eligible: true,
        }),
      ])

      const { result } = renderHook(
        () => useContractorList({ companyId: 'company-123', contractorType: 'terminated' }),
        { wrapper: TestWrapper },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.data.contractors[0]?.allowedActions).toEqual([
          'view',
          'cancel_dismissal',
        ])
      }
    })
  })

  describe('Actions', () => {
    it('onDelete deletes a contractor', async () => {
      server.use(handleDeleteContractor(() => new HttpResponse(null, { status: 204 })))

      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        const currentResult = result.current
        await act(async () => {
          await currentResult.actions.onDelete('contractor-1')
        })
        expect(result.current.status.isPending).toBe(false)
      }
    })

    it('onCancelSelfOnboarding reverts status to admin onboarding incomplete', async () => {
      let capturedRequestBody: unknown

      server.use(
        handleUpdateContractorOnboardingStatus(async ({ request }) => {
          capturedRequestBody = await request.json()
          return HttpResponse.json({
            uuid: 'contractor-1',
            onboarding_status: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          })
        }),
      )

      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        const currentResult = result.current
        let onboardingStatus
        await act(async () => {
          onboardingStatus = await currentResult.actions.onCancelSelfOnboarding('contractor-1')
        })

        expect(capturedRequestBody).toEqual({
          onboarding_status: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        })
        expect(onboardingStatus).toMatchObject({
          onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        })
      }
    })

    it('onCancelDismissal cancels a scheduled dismissal', async () => {
      const cancelResolver = vi.fn(() => new HttpResponse(null, { status: 204 }))
      server.use(handleCancelContractorDismissal(cancelResolver))

      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        const currentResult = result.current
        await act(async () => {
          await currentResult.actions.onCancelDismissal('contractor-1')
        })
        expect(cancelResolver).toHaveBeenCalledTimes(1)
      }
    })

    it('onCancelRehire cancels a scheduled rehire', async () => {
      const cancelResolver = vi.fn(() => new HttpResponse(null, { status: 204 }))
      server.use(handleCancelContractorRehire(cancelResolver))

      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        const currentResult = result.current
        await act(async () => {
          await currentResult.actions.onCancelRehire('contractor-1')
        })
        expect(cancelResolver).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Error handling', () => {
    it('provides the error handling interface', async () => {
      const { result } = renderHook(() => useContractorList({ companyId: 'company-123' }), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      if (!result.current.isLoading) {
        expect(result.current.errorHandling).toBeDefined()
        expect(result.current.errorHandling.errors).toEqual([])
        expect(result.current.errorHandling.retryQueries).toBeDefined()
        expect(result.current.errorHandling.clearSubmitError).toBeDefined()
      }
    })
  })
})
