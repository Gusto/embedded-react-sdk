import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.FederalTaxes')
  const Components = useComponentContext()

  return (
    <header>
      <h2>{t('pageTitle')}</h2>
      <p>
        <Trans
          t={t}
          i18nKey="entity_type_and_legal_name_intro"
          components={{
            einLink: (
              <Components.Link
                href="https://www.irs.gov/businesses/small-businesses-self-employed/lost-or-misplaced-your-ein"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </p>
    </header>
  )
}
