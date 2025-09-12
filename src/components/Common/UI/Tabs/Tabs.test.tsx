import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'
import type { TabProps } from './TabsTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Tabs', () => {
  const tabs: TabProps[] = [
    { id: 'tab1', label: 'First', content: <div>First content</div> },
    { id: 'tab2', label: 'Second', content: <div>Second content</div> },
    { id: 'tab3', label: 'Disabled', content: <div>Disabled content</div>, isDisabled: true },
  ]

  it('renders tabs and shows selected content', async () => {
    const onSelectionChange = vi.fn()
    renderWithProviders(
      <Tabs
        tabs={tabs}
        selectedId="tab1"
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    expect(await screen.findByRole('tab', { name: 'First' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Second' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Disabled' })).toBeInTheDocument()
    expect(await screen.findByText('First content')).toBeInTheDocument()
  })

  it('switches content when tab is clicked', async () => {
    const user = userEvent.setup()
    let selectedId = 'tab1'
    const onSelectionChange = vi.fn().mockImplementation(id => {
      selectedId = id
    })

    const { rerender } = renderWithProviders(
      <Tabs
        tabs={tabs}
        selectedId={selectedId}
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    await user.click(await screen.findByRole('tab', { name: 'Second' }))

    expect(onSelectionChange).toHaveBeenCalledWith('tab2')

    // Simulate parent component updating selectedId
    rerender(
      <Tabs
        tabs={tabs}
        selectedId="tab2"
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    expect(await screen.findByText('Second content')).toBeInTheDocument()
    expect(screen.queryByText('First content')).not.toBeInTheDocument()
  })

  it('calls onSelectionChange', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderWithProviders(
      <Tabs
        tabs={tabs}
        selectedId="tab1"
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    await user.click(await screen.findByRole('tab', { name: 'Second' }))

    expect(onSelectionChange).toHaveBeenCalledWith('tab2')
  })

  it('respects controlled selectedId', async () => {
    const onSelectionChange = vi.fn()
    renderWithProviders(
      <Tabs
        tabs={tabs}
        selectedId="tab2"
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    expect(await screen.findByText('Second content')).toBeInTheDocument()
  })

  it('prevents disabled tab selection', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderWithProviders(
      <Tabs
        tabs={tabs}
        selectedId="tab1"
        onSelectionChange={onSelectionChange}
        aria-label="Test tabs"
      />,
    )

    await user.click(await screen.findByRole('tab', { name: 'Disabled' }))

    expect(onSelectionChange).not.toHaveBeenCalled()
    expect(await screen.findByText('First content')).toBeInTheDocument()
    expect(screen.queryByText('Disabled content')).not.toBeInTheDocument()
  })
})
