import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import styles from './FieldLayout.module.scss'
import { createMarkup } from '@/helpers/formattedStrings'

export interface BaseFieldLayoutProps {
  description?: React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  label: React.ReactNode
  shouldVisuallyHideLabel?: boolean
}

interface FieldLayoutProps extends BaseFieldLayoutProps {
  children: React.ReactNode
  htmlFor: string
  errorMessageId: string
  className?: string
}

export const FieldLayout: React.FC<FieldLayoutProps> = ({
  label,
  description,
  errorMessage,
  errorMessageId,
  children,
  isRequired = false,
  htmlFor,
  shouldVisuallyHideLabel = false,
  className,
}: FieldLayoutProps) => {
  const { t } = useTranslation('common')

  const labelContent = (
    <label className={styles.label} htmlFor={htmlFor}>
      {label}{' '}
      {!isRequired ? <span className={styles.optionalLabel}>{t('optionalLabel')}</span> : null}
    </label>
  )

  return (
    <div className={classNames(styles.root, className)}>
      <div
        className={classNames(styles.labelAndDescription, {
          [styles.withMargin as string]: !shouldVisuallyHideLabel || Boolean(description),
        })}
      >
        {shouldVisuallyHideLabel ? <VisuallyHidden>{labelContent}</VisuallyHidden> : labelContent}
        {description &&
          (typeof description === 'string' ? (
            <div
              className={styles.description}
              dangerouslySetInnerHTML={createMarkup(description)}
            />
          ) : (
            <div className={styles.description}>{description}</div>
          ))}
      </div>
      {children}
      {errorMessage && (
        <div id={errorMessageId} className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}
