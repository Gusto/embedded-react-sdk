import { useTranslation } from 'react-i18next'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import { ContractorType as ApiContractorType } from '@gusto/embedded-api/models/components/contractor'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

interface LandingProps extends CommonComponentInterface<'Contractor.Landing'> {
  contractorId: string
  companyId: string
}

export function Landing(props: LandingProps & BaseComponentInterface) {
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

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const displayName = useMemo(() => {
    if (contractor?.type === ApiContractorType.Individual) {
      return DOMPurify.sanitize(contractor.firstName ?? '')
    }
    return DOMPurify.sanitize(contractor?.businessName ?? '')
  }, [contractor])

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const sanitizedCompanyName = useMemo(() => DOMPurify.sanitize(company?.name ?? ''), [company])

  const { t } = useTranslation('Contractor.Landing')

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
                name: displayName,
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
                t('steps.personalInfo'),
                t('steps.addressInfo'),
                t('steps.bankInfo'),
                t('steps.documents'),
              ]}
            />
          </Flex>
        </Flex>
      </Components.Box>
    </section>
  )
}
