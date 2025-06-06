import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Input } from './Input'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('Input', () => {
  describe('Accessibility', () => {
    it('should not have any accessibility violations - input with label', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - input with aria-label', async () => {
      const { container } = renderWithProviders(<Input aria-label="Search input" />)
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - disabled input', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="disabled-input">Disabled Field</label>
          <Input id="disabled-input" isDisabled />
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - input with error state', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="error-input">Field with Error</label>
          <Input id="error-input" aria-invalid="true" aria-describedby="error-msg" />
          <div id="error-msg">This field has an error</div>
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - input with placeholder', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="placeholder-input">Enter text</label>
          <Input id="placeholder-input" placeholder="Type here..." />
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - input with adornments', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="adornment-input">Search</label>
          <Input
            id="adornment-input"
            adornmentStart={<span>🔍</span>}
            adornmentEnd={<span>⌘K</span>}
          />
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})
