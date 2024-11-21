import { Link } from 'react-aria-components'
import { Trans, useTranslation } from 'react-i18next'

export function FederalHead() {
  const { t } = useTranslation('Employee.Taxes')

  return (
    <>
      <h2>{t('federalTaxesTitle')}</h2>
      <p>
        <Trans
          i18nKey={'irs_calculator'}
          t={t}
          components={{
            irs_calculator: <Link />,
            help_center: <Link />,
          }}
        />
      </p>
    </>
  )
}
