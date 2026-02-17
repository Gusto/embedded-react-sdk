import { useCompanyStateTaxes } from './useCompanyStateTaxes'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)

  const {
    meta: { machine },
  } = useCompanyStateTaxes({ companyId })

  return <Flow machine={machine} onEvent={onEvent} />
}
