import { Link } from 'react-aria-components'
import { Trans, useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Company.FederalTaxes')

  return (
    <header>
      <h2>{t('pageTitle')}</h2>
      <p>
        <Trans
          t={t}
          i18nKey="entity_type_and_legal_name_intro"
          components={{
            einLink: (
              <Link
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
