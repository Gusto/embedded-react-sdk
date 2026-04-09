import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { DocumentsView } from './DocumentsView'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('DocumentsView', () => {
  it('calls onViewForm with the row form uuid when View is clicked', async () => {
    const user = userEvent.setup()
    const onViewForm = vi.fn()
    const form = {
      uuid: 'form-uuid-for-view',
      title: 'Sample Form',
      year: 2025,
      draft: false,
      requiresSigning: true,
    } as Form

    renderWithProviders(<DocumentsView forms={[form]} onViewForm={onViewForm} />)

    const viewButton =
      screen.queryByRole('button', { name: 'View' }) ??
      screen.getByRole('button', { name: 'documents.viewCta' })
    await user.click(viewButton)

    expect(onViewForm).toHaveBeenCalledTimes(1)
    expect(onViewForm).toHaveBeenCalledWith('form-uuid-for-view')
  })
})
