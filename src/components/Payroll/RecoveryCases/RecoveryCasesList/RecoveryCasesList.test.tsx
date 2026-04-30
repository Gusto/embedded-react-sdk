import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { RecoveryCasesList } from './RecoveryCasesList'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  getEmptyRecoveryCases,
  handleGetRecoveryCases,
  mockRecoveryCases,
} from '@/test/mocks/apis/recovery_cases'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('RecoveryCasesList', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders table with description when recovery cases exist', async () => {
    server.use(handleGetRecoveryCases(() => HttpResponse.json(mockRecoveryCases)))
    renderWithProviders(<RecoveryCasesList {...defaultProps} />)

    await screen.findByText('Recovery cases')
    const loader = screen.getByLabelText('Loading component...')
    await waitForElementToBeRemoved(loader)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recovery cases')
    expect(screen.getByText(/One or more payments.*/)).toBeInTheDocument()

    // Each recovery case's original debit date is the header for that row
    const rowHeaderLabels = screen.getAllByRole('rowheader').map($el => $el.textContent)
    expect(rowHeaderLabels).toEqual(['2024-01-05', '2024-01-10', '-'])
  })

  it('renders empty table without description when no recovery cases', async () => {
    server.use(getEmptyRecoveryCases)

    renderWithProviders(<RecoveryCasesList {...defaultProps} />)

    await screen.findByText('Recovery cases')

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recovery cases')
    expect(screen.queryByText(/One or more payments.*/)).not.toBeInTheDocument()

    expect(screen.getByRole('rowheader')).toHaveTextContent(/No recovery cases.*/)
  })
})
