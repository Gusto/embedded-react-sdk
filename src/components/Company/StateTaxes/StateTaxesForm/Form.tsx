import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { RequirementFields } from '../shared/RequirementFields'
import { getUniqueRhfKey } from '../shared/rhfKey'
import { useStateTaxesForm } from './context'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/** @internal */
export function Form() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const dateFormatter = useDateFormatter()
  const { stateTaxRequirements } = useStateTaxesForm()
  const Components = useComponentContext()
  const requirementSets = stateTaxRequirements.requirementSets ?? []

  // A single key (e.g. "taxrates") can appear in more than one set when a future-dated set is
  // already scheduled alongside the current one — each rendered section still needs its own
  // disambiguated form path so the two sections' fields don't share state.
  return requirementSets.map((requirementSet, index) => {
    const { requirements, label, effectiveFrom, key } = requirementSet
    if (!key) return null
    const requirementSetPath = getUniqueRhfKey(requirementSet, index, requirementSets)
    return (
      <Fragment key={requirementSetPath}>
        <div>
          <Components.Heading as="h3">{label}</Components.Heading>
          {effectiveFrom && (
            <Components.Text size="sm">
              {t('effectiveFromLabel', { date: dateFormatter.formatLongWithYear(effectiveFrom) })}
            </Components.Text>
          )}
        </div>
        <RequirementFields requirements={requirements} requirementSetKey={requirementSetPath} />
      </Fragment>
    )
  })
}
