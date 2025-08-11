import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import { FederalTaxes } from '../FederalTaxes/FederalTaxes'
import { StateTaxes } from '../StateTaxes/StateTaxes'
import type { EventType } from '@/shared/constants'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useFlow } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'

interface TaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function Taxes(props: TaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = (props: TaxesProps) => {
  const { employeeId, className, children, isAdmin, dictionary } = props
  const { onEvent } = useBase()
  const [showStateTaxes, setShowStateTaxes] = useState(false)

  useI18n('Employee.Taxes')
  useComponentDictionary('Employee.Taxes', dictionary)

  const handleFederalTaxesDone = (eventType: EventType, payload?: unknown) => {
    // Forward the federal taxes events
    onEvent(eventType, payload)

    if (eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
      setShowStateTaxes(true)
    }
  }

  const handleStateTaxesDone = (eventType: EventType, payload?: unknown) => {
    // Forward the state taxes events
    onEvent(eventType, payload)

    if (eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
      // Fire the legacy combined event for backward compatibility
      onEvent(componentEvents.EMPLOYEE_TAXES_DONE)
    }
  }

  return (
    <section className={className}>
      {children ? (
        children
      ) : (
        <>
          {!showStateTaxes ? (
            <FederalTaxes
              employeeId={employeeId}
              onEvent={handleFederalTaxesDone}
              isAdmin={isAdmin}
            />
          ) : (
            <StateTaxes employeeId={employeeId} onEvent={handleStateTaxesDone} isAdmin={isAdmin} />
          )}
        </>
      )}
    </section>
  )
}

export const TaxesContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation()
  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EmployeeTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Taxes employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin ?? false} />
}
