import { InternalError } from './InternalError'

export default {
  title: 'Common/InternalError',
}

const mockError = new Error('This is a mock error message')
const mockResetHandler = () => {}

export const DefaultError = () => {
  return <InternalError error={mockError} resetErrorBoundary={mockResetHandler} />
}
