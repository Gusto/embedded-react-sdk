import { handlers } from './handlers'
import { server } from './server'

export const setupApiTestMocks = () => {
  server.use(...handlers)
}
