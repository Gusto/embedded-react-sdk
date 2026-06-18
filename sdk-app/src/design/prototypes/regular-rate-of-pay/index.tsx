import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../../../useEntities'
import { ComponentStatesPage } from '../ComponentStatesPage'
import { RegularRateOfPay } from './RegularRateOfPay'
import { components } from './states'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BASE_PATH = '/design/regular-rate-of-pay'

export function RegularRateOfPayPrototype() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const Components = useComponentContext()

  if (!entities.companyId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Components.Heading as="h2">Regular rate of pay</Components.Heading>
        <Components.Alert label="Missing company ID" status="warning">
          Set this in Settings (top right) to load real data for this prototype.
        </Components.Alert>
      </Flex>
    )
  }

  return (
    <RegularRateOfPay
      companyId={entities.companyId}
      preferredPayrollId={entities.payrollId || undefined}
    />
  )
}

export function RegularRateOfPayStates() {
  return <ComponentStatesPage basePath={`${BASE_PATH}/component-states`} components={components} />
}
