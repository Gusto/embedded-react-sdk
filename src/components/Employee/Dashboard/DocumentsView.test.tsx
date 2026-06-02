import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Form } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { DocumentsView } from './DocumentsView'
import { assertLength } from '@/test-utils/assertions'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const baseForm: Form = {
  uuid: 'form-1',
  title: 'Form W-4',
  year: null,
  draft: false,
  requiresSigning: false,
}

describe('DocumentsView', () => {
  it('shows a loading indicator while data is loading', () => {
    renderWithProviders(<DocumentsView isLoading />)

    expect(screen.getByRole('region', { name: /loading/i })).toBeInTheDocument()
  })

  it('shows an empty state when there are no forms', () => {
    renderWithProviders(<DocumentsView forms={[]} />)

    expect(screen.getByText('documents.emptyState.title')).toBeInTheDocument()
  })

  it('renders the form title', () => {
    renderWithProviders(
      <DocumentsView forms={[{ ...baseForm, title: 'Employee Direct Deposit Authorization' }]} />,
    )

    expect(screen.getByText('Employee Direct Deposit Authorization')).toBeInTheDocument()
  })

  it('renders the year when a form has one', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, year: 2024 }]} />)

    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders a placeholder when a form has no year', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, year: null }]} />)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('shows Draft status for draft forms', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, draft: true }]} />)

    expect(screen.getByText('documents.status.draft')).toBeInTheDocument()
  })

  it('shows Final status for finalized forms', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, draft: false }]} />)

    expect(screen.getByText('documents.status.final')).toBeInTheDocument()
  })

  it('shows a Not signed badge for forms that require signing', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, requiresSigning: true }]} />)

    expect(screen.getByText('documents.signingStatus.notSigned')).toBeInTheDocument()
  })

  it('shows a Signed badge for forms that have already been signed', () => {
    renderWithProviders(<DocumentsView forms={[{ ...baseForm, requiresSigning: false }]} />)

    expect(screen.getByText('documents.signingStatus.signed')).toBeInTheDocument()
  })

  it('calls onViewForm with the form UUID when View is clicked', async () => {
    const user = userEvent.setup()
    const onViewForm = vi.fn<(formUuid: string) => void>()
    renderWithProviders(<DocumentsView forms={[baseForm]} onViewForm={onViewForm} />)

    await user.click(screen.getByRole('button', { name: 'documents.viewCta' }))

    expect(onViewForm).toHaveBeenCalledTimes(1)
    expect(onViewForm).toHaveBeenCalledWith('form-1')
  })

  it('renders all forms and each View button passes the correct UUID', async () => {
    const user = userEvent.setup()
    const onViewForm = vi.fn<(formUuid: string) => void>()
    const forms: Form[] = [
      { ...baseForm, uuid: 'form-uuid-1', title: 'Form W-4' },
      { ...baseForm, uuid: 'form-uuid-2', title: 'Form I-9' },
    ]
    renderWithProviders(<DocumentsView forms={forms} onViewForm={onViewForm} />)

    expect(screen.getByText('Form W-4')).toBeInTheDocument()
    expect(screen.getByText('Form I-9')).toBeInTheDocument()

    const viewButtons = screen.getAllByRole('button', { name: 'documents.viewCta' })
    assertLength(viewButtons, 2)
    await user.click(viewButtons[1])
    expect(onViewForm).toHaveBeenCalledWith('form-uuid-2')
  })
})
