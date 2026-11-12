import { useTranslation } from 'react-i18next'
import { StateTaxesList } from '../StateTaxesList/StateTaxesList'
import { List } from '../StateTaxesList/List'
import type { StateTaxesContextInterface } from '../StateTaxesComponents'
import { Flex } from '@/components/Common'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'

/**
 * Steady-state state list.
 *
 * @remarks
 * Composes `StateTaxesList` with only its table, under a heading of its own. The onboarding list
 * is one step of a larger setup flow, so it carries a Continue button and a standing warning
 * that self-onboarding employees can reopen setup. Here the list is a resting screen: there is
 * nothing to continue to, and a state that needs setup again already shows it in its status
 * badge.
 *
 * @internal
 */
export function StateTaxesManagementListContextual() {
  const { companyId, onEvent } = useFlow<StateTaxesContextInterface>()
  useI18n('Company.StateTaxes')
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'management' })
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{t('title')}</Components.Heading>
        <Components.Text>{t('description')}</Components.Text>
      </Flex>
      <StateTaxesList companyId={ensureRequired(companyId)} onEvent={onEvent}>
        <List />
      </StateTaxesList>
    </Flex>
  )
}
