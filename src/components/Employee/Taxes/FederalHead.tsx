import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function FederalHead() {
  const { t } = useTranslation('Employee.Taxes')
  const Components = useComponentContext()

  return (
    <>
      <Components.Heading as="h2">{t('federalTaxesTitle')}</Components.Heading>
      <Components.Text>
        <Trans
          i18nKey={'irs_calculator'}
          t={t}
          components={{
            irs_calculator: <Components.Link />,
            help_center: <Components.Link />,
          }}
        />
      </Components.Text>
    </>
  )
}
