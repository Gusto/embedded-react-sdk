import { useTranslation } from 'react-i18next'
import { useCompanyFormsSummary } from '../../shared/useCompanyFormsSummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link CompanyFormsCard}.
 *
 * @alpha
 */
export interface CompanyFormsCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link CompanyFormsCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone "Documents" card summarizing a company's forms and what still needs signing.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/companyForms/editRequested` when the Manage button is
 * clicked. The card reports how many forms await signature, names them, and
 * gives the size of the company's document set; it does not list the set
 * itself, which grows with every tax filing.
 *
 * A form carries no signed-on date — the API models signing state as a
 * `requires_signing` flag that flips once the form is signed — so the card
 * reports what is outstanding rather than a signing history.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/companyForms/editRequested` | Fired when "Manage" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link CompanyFormsCardProps}.
 * @returns The company forms summary card.
 * @alpha
 */
export function CompanyFormsCard(props: CompanyFormsCardProps) {
  return (
    <BaseBoundaries
      componentName="Company.Management.CompanyForms"
      LoaderComponent={props.LoaderComponent}
    >
      <CompanyFormsCardContent {...props} />
    </BaseBoundaries>
  )
}

function CompanyFormsCardContent({ companyId, onEvent, LoaderComponent }: CompanyFormsCardProps) {
  useI18n('Company.Management.CompanyForms')
  const { t } = useTranslation('Company.Management.CompanyForms')
  const Components = useComponentContext()

  const summary = useCompanyFormsSummary({ companyId })

  const isLoading = summary.isLoading
  const forms = summary.isLoading ? [] : summary.data.forms
  const formsAwaitingSignature = summary.isLoading ? [] : summary.data.formsAwaitingSignature

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_REQUESTED, { companyId })
  }

  const signatureDescription =
    formsAwaitingSignature.length > 0 ? (
      <Components.Badge status="warning">
        {t('card.awaitingCount', { count: formsAwaitingSignature.length })}
      </Components.Badge>
    ) : (
      <Components.Badge status="success">{t('card.allSigned')}</Components.Badge>
    )

  const awaitingItems =
    formsAwaitingSignature.length > 0
      ? [
          {
            term: t('card.awaitingSignature'),
            description: (
              <Flex flexDirection="column" gap={4}>
                {formsAwaitingSignature.map(form => (
                  <Components.Text key={form.uuid} size="sm">
                    {form.title || form.name || t('card.untitledForm')}
                  </Components.Text>
                ))}
              </Flex>
            ),
          },
        ]
      : []

  const items = [
    { term: t('card.signatures'), description: signatureDescription },
    ...awaitingItems,
    { term: t('card.documents'), description: t('card.documentCount', { count: forms.length }) },
  ]

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              <Components.Button
                variant="secondary"
                onClick={handleManage}
                isDisabled={isLoading}
                aria-label={t('card.manageAriaLabel')}
              >
                {t('card.manageCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : forms.length > 0 ? (
            <Components.DescriptionList items={items} />
          ) : (
            <EmptyData
              title={t('card.emptyState.title')}
              description={t('card.emptyState.description')}
            />
          )}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
