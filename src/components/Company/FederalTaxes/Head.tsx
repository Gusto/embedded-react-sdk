import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'

export function Head() {
  const { t } = useTranslation('Company.FederalTaxes')
  const Components = useComponentContext()

  return (
    <header>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
        <Components.Text variant="supporting">
          <Trans
            t={t}
            i18nKey="entityTypeAndLegalNameIntro"
            components={{
              einLink: (
                <Components.Link
                  href="https://www.irs.gov/businesses/employer-identification-number#lost"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </Components.Text>
      </Flex>
    </header>
  )
}
