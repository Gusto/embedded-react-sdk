import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { Form } from './Form'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Form', () => {
  it('disables native browser validation by default', () => {
    renderWithProviders(
      <Form data-testid="form">
        <button type="submit">Submit</button>
      </Form>,
    )
    expect(screen.getByTestId('form')).toHaveAttribute('novalidate')
  })

  it('allows native validation to be re-enabled via the noValidate prop', () => {
    renderWithProviders(
      <Form data-testid="form" noValidate={false}>
        <button type="submit">Submit</button>
      </Form>,
    )
    expect(screen.getByTestId('form')).not.toHaveAttribute('novalidate')
  })

  it('prevents default submission and forwards the event to onSubmit', () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <Form data-testid="form" onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </Form>,
    )

    fireEvent.submit(screen.getByTestId('form'))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0]![0]!.defaultPrevented).toBe(true)
  })
})
