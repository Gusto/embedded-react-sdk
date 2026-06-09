import classNames from 'classnames'
import { VisuallyHidden } from '../VisuallyHidden'
import { FieldErrorMessage } from '../FieldErrorMessage'
import { FieldDescription } from '../FieldDescription'
import styles from './HorizontalFieldLayout.module.scss'
import type { HorizontalFieldLayoutProps } from './HorizontalFieldLayoutTypes'
import { getDataProps } from '@/helpers/getDataProps'

/**
 * Layout that positions a form control's children alongside its label, description, and error message.
 *
 * @param props - See {@link HorizontalFieldLayoutProps}.
 * @returns The control's children laid out horizontally with associated label and helper text.
 * @internal
 */
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
