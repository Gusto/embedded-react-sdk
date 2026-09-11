import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { PolicyTypeSelector } from './PolicyTypeSelector'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('PolicyTypeSelector', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the heading', async () => {
    renderWithProviders(<PolicyTypeSelector {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Select policy type')).toBeInTheDocument()
    })
  })

  it('applies custom className to the root element', async () => {
    const { container } = renderWithProviders(
      <PolicyTypeSelector {...defaultProps} className="custom-class" />,
    )

    await waitFor(() => {
      expect(screen.getByText('Select policy type')).toBeInTheDocument()
    })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
