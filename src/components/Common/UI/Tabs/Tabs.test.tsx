import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'
import type { TabProps } from './TabsTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints')

describe('Tabs', () => {
  const tabs: TabProps[] = [
    { id: 'tab1', label: 'First', content: <div>First content</div> },
    { id: 'tab2', label: 'Second', content: <div>Second content</div> },
    { id: 'tab3', label: 'Disabled', content: <div>Disabled content</div>, isDisabled: true },
  ]

  describe('Desktop mode (horizontal tabs)', () => {
    beforeEach(async () => {
      const { useContainerBreakpoints } = await import(
        '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
      )
      vi.mocked(useContainerBreakpoints).mockReturnValue(['base', 'small', 'medium'])
    })

    it('renders horizontal tabs and shows selected content', async () => {
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

    it('calls onSelectionChange when tab is clicked', async () => {
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

      const disabledTab = await screen.findByRole('tab', { name: 'Disabled' })
      await user.click(disabledTab)

      expect(onSelectionChange).not.toHaveBeenCalled()
      expect(await screen.findByText('First content')).toBeInTheDocument()
      expect(screen.queryByText('Disabled content')).not.toBeInTheDocument()
    })
  })

  describe('Mobile mode (dropdown)', () => {
    beforeEach(async () => {
      const { useContainerBreakpoints } = await import(
        '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
      )
      vi.mocked(useContainerBreakpoints).mockReturnValue(['base'])
    })

    it('renders dropdown and shows selected content', async () => {
      const onSelectionChange = vi.fn()
      renderWithProviders(
        <Tabs
          tabs={tabs}
          selectedId="tab1"
          onSelectionChange={onSelectionChange}
          aria-label="Test tabs"
        />,
      )

      expect(await screen.findByRole('button', { name: /First/i })).toBeInTheDocument()
      expect(screen.queryByRole('tab')).not.toBeInTheDocument()
      expect(await screen.findByText('First content')).toBeInTheDocument()
    })

    it('switches content when option is selected from dropdown', async () => {
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

      const button = await screen.findByRole('button', { name: /First/i })
      await user.click(button)

      const secondOption = await screen.findByRole('option', { name: 'Second' })
      await user.click(secondOption)

      expect(onSelectionChange).toHaveBeenCalledWith('tab2')

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

    it('calls onSelectionChange when dropdown option is selected', async () => {
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

      const button = await screen.findByRole('button', { name: /First/i })
      await user.click(button)

      const secondOption = await screen.findByRole('option', { name: 'Second' })
      await user.click(secondOption)

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

      expect(await screen.findByRole('button', { name: /Second/i })).toBeInTheDocument()
      expect(await screen.findByText('Second content')).toBeInTheDocument()
    })

    it('shows disabled options in dropdown', async () => {
      const onSelectionChange = vi.fn()
      renderWithProviders(
        <Tabs
          tabs={tabs}
          selectedId="tab1"
          onSelectionChange={onSelectionChange}
          aria-label="Test tabs"
        />,
      )

      const button = await screen.findByRole('button', { name: /First/i })
      expect(button).toBeInTheDocument()
      expect(await screen.findByText('First content')).toBeInTheDocument()
      expect(screen.queryByText('Disabled content')).not.toBeInTheDocument()
    })
  })
})
