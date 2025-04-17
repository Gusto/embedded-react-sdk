import classNames from 'classnames'
import { FieldDescription } from '../FieldDescription'
import { FieldErrorMessage } from '../FieldErrorMessage'
import { FieldCaption } from '../FieldCaption/FieldCaption'
import styles from './FieldLayout.module.scss'
import { getDataProps } from '@/helpers/getDataProps'
import type { FieldLayoutProps } from '@/types/UI/FieldLayout'

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
  return (
    <div className={classNames(styles.root, className)} {...getDataProps(props)}>
      <div
        className={classNames(styles.labelAndDescription, {
          [styles.withVisibleLabel as string]: !shouldVisuallyHideLabel,
          [styles.withDescription as string]: Boolean(description),
        })}
      >
        <FieldCaption
          htmlFor={htmlFor}
          isRequired={isRequired}
          isVisuallyHidden={shouldVisuallyHideLabel}
        >
          {label}
        </FieldCaption>
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      </div>
      {children}
      <FieldErrorMessage id={errorMessageId} className={styles.errorMessage}>
        {errorMessage}
      </FieldErrorMessage>
    </div>
  )
}
