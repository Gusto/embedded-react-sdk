import type { PrototypeComponent } from '../../prototypeTypes'
import { compensationHistoryConfigurations } from '../../../components/employee/management/CompensationHistory/CompensationHistoryConfigurations'

export const components: PrototypeComponent[] = [
  {
    slug: 'compensation-history',
    name: 'Compensation History',
    configurations: compensationHistoryConfigurations,
  },
]
