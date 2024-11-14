import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

import '@/i18n'
import '@testing-library/jest-dom'
import { AllTheProviders } from './AllTheProviders'

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }
