import { setupWorker } from 'msw/browser'
import { handlers } from '../../src/test/mocks/handlers'

export const worker = setupWorker(...handlers)
