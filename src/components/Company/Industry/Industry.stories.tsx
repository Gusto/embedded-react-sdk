import { fn } from 'storybook/test'
import { Industry } from './Industry'

export default {
  title: 'Domain/Company/Industry',
}

const companyId = 'mock-company-id'

export const Default = () => <Industry companyId={companyId} onEvent={fn()} />
