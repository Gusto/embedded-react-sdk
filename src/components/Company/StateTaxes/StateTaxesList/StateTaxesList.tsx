import { useTaxRequirementsGetAllSuspense } from '@gusto/embedded-api/react-query/taxRequirementsGetAll'
import { StateTaxesListPresentation } from './StateTaxesListPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { componentEvents } from '@/shared/constants'
import { useBase } from '@/components/Base'

interface StateTaxesListProps extends BaseComponentInterface {
  companyId: string
}

export function StateTaxesList(props: StateTaxesListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId }: StateTaxesListProps) {
  useI18n('Company.StateTaxes')
  const { onEvent } = useBase()
  const { data } = useTaxRequirementsGetAllSuspense({ companyUuid: companyId })
  const stateTaxRequirements = data.taxRequirementStatesList!

  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_STATE_TAX_DONE)
  }

  const handleChange = (state: string) => {
    onEvent(componentEvents.COMPANY_STATE_TAX_EDIT, { state })
  }

  return (
    <StateTaxesListPresentation
      stateTaxRequirements={stateTaxRequirements}
      handleContinue={handleContinue}
      handleChange={handleChange}
    />
  )
}
