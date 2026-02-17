import { useCompanyLocations } from './useCompanyLocations'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface LocationsProps extends BaseComponentInterface<'Company.Locations'> {
  companyId: string
}

export function Locations({ companyId, onEvent, dictionary }: LocationsProps) {
  useComponentDictionary('Company.Locations', dictionary)

  const {
    meta: { machine },
  } = useCompanyLocations({ companyId })

  return <Flow machine={machine} onEvent={onEvent} />
}
