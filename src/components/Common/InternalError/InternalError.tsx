import type { FallbackProps } from 'react-error-boundary'
import { Trans, useTranslation } from 'react-i18next'
import styles from './InternalError.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const InternalError = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation('common')
  const Components = useComponentContext()
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : t('errors.unknownError')
  return (
    <div className={styles.internalErrorCard} role="alert" data-testid="internal-error-card">
      <div>
        <Components.Heading className={styles.internalErrorCardTitle} as="h1" styledAs="h3">
          {t('errors.errorHeading')}
        </Components.Heading>
        <Components.Text className={styles.errorMessage}>
          <Trans
            t={t}
            i18nKey="errors.globalReactError"
            values={{ error: errorMessage }}
            shouldUnescape
          />
        </Components.Text>
      </div>
      <div>
        <Components.Button variant="secondary" onClick={resetErrorBoundary}>
          {t('errors.resetGlobalError')}
        </Components.Button>
      </div>
    </div>
  )
}
