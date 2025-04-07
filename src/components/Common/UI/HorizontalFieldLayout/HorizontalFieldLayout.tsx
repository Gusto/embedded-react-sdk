import classNames from 'classnames'
import { FieldErrorMessage } from '../FieldErrorMessage'
import { FieldDescription } from '../FieldDescription'
import type { SharedFieldLayoutProps, InternalFieldLayoutProps } from '../FieldLayout'
import styles from './HorizontalFieldLayout.module.scss'

export type SharedHorizontalFieldLayoutProps = Omit<
  SharedFieldLayoutProps,
  'shouldVisuallyHideLabel'
>

export type HorizontalFieldLayoutProps = SharedHorizontalFieldLayoutProps & InternalFieldLayoutProps

export const HorizontalFieldLayout: React.FC<HorizontalFieldLayoutProps> = ({
  label,
  description,
  descriptionId,
  errorMessage,
  errorMessageId,
  children,
  htmlFor,
  className,
}: HorizontalFieldLayoutProps) => {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.children}>{children}</div>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      <FieldDescription id={descriptionId} className={styles.description}>
        {description}
      </FieldDescription>
      <FieldErrorMessage id={errorMessageId} className={styles.errorMessage}>
        {errorMessage}
      </FieldErrorMessage>
    </div>
  )
}
