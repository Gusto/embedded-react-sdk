import type { Story } from '@ladle/react'
import { InternalError } from './InternalError'

export default {
  title: 'Common/InternalError',
}

const mockError = new Error('This is a mock error message')
const mockResetHandler = () => {}

export const DefaultError: Story = () => {
  return <InternalError error={mockError} resetErrorBoundary={mockResetHandler} />
}
