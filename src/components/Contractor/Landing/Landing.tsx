import { useTranslation } from 'react-i18next'
import { useContractorsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorsGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/companiesGet'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

/**
 * Props for the {@link Landing} component.
 *
 * @public
 */
export interface LandingProps extends BaseComponentInterface<'Contractor.Landing'> {
  /** UUID of the contractor entering the self-onboarding flow. */
  contractorId: string
  /** UUID of the company the contractor belongs to. */
  companyId: string
}

/**
 * Landing page for the contractor self-onboarding flow. Displays a welcome
 * message and the list of onboarding steps the contractor needs to complete.
 *
 * @public
 */
export function Landing(props: LandingProps) {
  useI18n('Contractor.Landing')
  useComponentDictionary('Contractor.Landing', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ contractorId, companyId, className }: LandingProps) => {
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const { t } = useTranslation('Contractor.Landing')

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const sanitizedContractorName = useMemo(
    () =>
      DOMPurify.sanitize(contractor?.firstName ?? contractor?.businessName ?? t('fallbackName')),
    [contractor, t],
  )

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const sanitizedCompanyName = useMemo(() => DOMPurify.sanitize(company?.name ?? ''), [company])

  return (
    <section className={className}>
      <Components.Box
        footer={
          <ActionsLayout>
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEvent(componentEvents.CONTRACTOR_SELF_ONBOARDING_START)
              }}
            >
              {t('getStartedCta')}
              <ArrowRightIcon aria-hidden />
            </Components.Button>
          </ActionsLayout>
        }
      >
        <Flex alignItems="center" flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              {t('landingSubtitle', {
                contractorName: sanitizedContractorName,
                companyName: sanitizedCompanyName,
                interpolation: { escapeValue: false },
              })}
            </Components.Heading>
            <Components.Text variant="supporting">{t('landingDescription')}</Components.Text>
          </Flex>
          <Flex flexDirection="column" gap={8}>
            <Components.Heading as="h3">{t('stepsSubtitle')}</Components.Heading>
            <Components.UnorderedList
              items={[
                t('steps.profile'),
                t('steps.address'),
                t('steps.paymentMethod'),
                t('steps.documents'),
              ]}
            />
          </Flex>
        </Flex>
      </Components.Box>
    </section>
  )
}
