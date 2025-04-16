import classNames from 'classnames'
import { VisuallyHidden } from 'react-aria'
import { FieldErrorMessage } from '../FieldErrorMessage'
import { FieldDescription } from '../FieldDescription'
import type { SharedFieldLayoutProps, InternalFieldLayoutProps } from '../FieldLayout'
import styles from './HorizontalFieldLayout.module.scss'
import { getDataProps } from '@/helpers/getDataProps'
export type SharedHorizontalFieldLayoutProps = SharedFieldLayoutProps

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
  shouldVisuallyHideLabel,
  ...props
}: HorizontalFieldLayoutProps) => {
  const labelContent = (
    <label className={styles.label} htmlFor={htmlFor}>
      {label}
    </label>
  )

  const withDescriptionOrErrorMessage = description || errorMessage

  return (
    <div
      className={classNames(
        styles.root,
        {
          [styles.withoutVisibleLabel as string]:
            shouldVisuallyHideLabel && withDescriptionOrErrorMessage,
          [styles.withOnlyChildren as string]:
            shouldVisuallyHideLabel && !withDescriptionOrErrorMessage,
        },
        className,
      )}
      {...getDataProps(props)}
    >
      <div className={styles.children}>{children}</div>
      {shouldVisuallyHideLabel ? <VisuallyHidden>{labelContent}</VisuallyHidden> : labelContent}
      <FieldDescription id={descriptionId} className={styles.description}>
        {description}
      </FieldDescription>
      <FieldErrorMessage id={errorMessageId} className={styles.errorMessage}>
        {errorMessage}
      </FieldErrorMessage>
    </div>
  )
}
