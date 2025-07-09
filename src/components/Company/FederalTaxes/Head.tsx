import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.FederalTaxes')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
      <Components.Text>
        <Trans
          t={t}
          i18nKey="entity_type_and_legal_name_intro"
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
    </header>
  )
}
