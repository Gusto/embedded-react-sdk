import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { FieldDescription } from '../FieldDescription'
import { FieldErrorMessage } from '../FieldErrorMessage'
import styles from './FieldLayout.module.scss'
import type { DataAttributes } from '@/types/Helpers'
import { getDataProps } from '@/helpers/getDataProps'

export interface SharedFieldLayoutProps extends DataAttributes {
  description?: React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  label: React.ReactNode
  shouldVisuallyHideLabel?: boolean
}

export interface InternalFieldLayoutProps {
  children: React.ReactNode
  htmlFor: string
  errorMessageId: string
  descriptionId: string
  className?: string
}

export interface FieldLayoutProps extends SharedFieldLayoutProps, InternalFieldLayoutProps {}

export const FieldLayout: React.FC<FieldLayoutProps> = ({
  label,
  description,
  descriptionId,
  errorMessage,
  errorMessageId,
  children,
  isRequired = false,
  htmlFor,
  shouldVisuallyHideLabel = false,
  className,
  ...props
}: FieldLayoutProps) => {
  const { t } = useTranslation('common')

  const labelContent = (
    <label className={styles.label} htmlFor={htmlFor}>
      {label}{' '}
      {!isRequired ? <span className={styles.optionalLabel}>{t('optionalLabel')}</span> : null}
    </label>
  )

  return (
    <div className={classNames(styles.root, className)} {...getDataProps(props)}>
      <div
        className={classNames(styles.labelAndDescription, {
          [styles.withVisibleLabel as string]: !shouldVisuallyHideLabel,
          [styles.withDescription as string]: Boolean(description),
        })}
      >
        {shouldVisuallyHideLabel ? <VisuallyHidden>{labelContent}</VisuallyHidden> : labelContent}
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      </div>
      {children}
      <FieldErrorMessage id={errorMessageId} className={styles.errorMessage}>
        {errorMessage}
      </FieldErrorMessage>
    </div>
  )
}
