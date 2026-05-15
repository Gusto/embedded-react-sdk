import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export function FederalHead() {
  const { t } = useTranslation('Employee.Taxes')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{t('federalTaxesTitle')}</Components.Heading>
      <Components.Text variant="supporting">
        <Trans
          i18nKey={'irsCalculator'}
          t={t}
          components={{
            IrsCalculatorLink: <Components.Link />,
            HelpCenterLink: <Components.Link />,
          }}
        />
      </Components.Text>
    </Flex>
  )
}
