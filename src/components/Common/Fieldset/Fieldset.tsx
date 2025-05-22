import { useId } from 'react'
import classNames from 'classnames'
import { FieldDescription } from '../FieldDescription'
import { FieldErrorMessage } from '../FieldErrorMessage'
import { FieldCaption } from '../FieldCaption'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'
import styles from './Fieldset.module.scss'
import { getDataProps } from '@/helpers/getDataProps'

export interface FieldsetProps
  extends Omit<SharedFieldLayoutProps, 'label' | 'shouldVisuallyHideLabel'> {
  children: React.ReactNode
  description?: React.ReactNode
  errorMessage?: string
  isRequired?: boolean
  legend: React.ReactNode
  shouldVisuallyHideLegend?: boolean
  className?: string
}

export const Fieldset: React.FC<FieldsetProps> = ({
  children,
  description,
  errorMessage,
  isRequired = false,
  legend,
  shouldVisuallyHideLegend = false,
  className,
  ...props
}: FieldsetProps) => {
  const generatedErrorMessageId = useId()
  const errorMessageId = `error-message-${generatedErrorMessageId}`

  return (
    <fieldset
      className={classNames(styles.root, className)}
      aria-describedby={errorMessage ? errorMessageId : undefined}
      {...getDataProps(props)}
    >
      <div
        className={classNames(styles.legendAndDescription, {
          [styles.withVisibleLegend as string]: !shouldVisuallyHideLegend,
          [styles.withDescription as string]: Boolean(description),
        })}
      >
        <FieldCaption
          as="legend"
          isRequired={isRequired}
          isVisuallyHidden={shouldVisuallyHideLegend}
        >
          {legend}
        </FieldCaption>
        <FieldDescription>{description}</FieldDescription>
      </div>
      {children}
      <FieldErrorMessage
        id={errorMessageId}
        className={styles.errorMessage}
        aria-live="polite"
        role="alert"
      >
        {errorMessage}
      </FieldErrorMessage>
    </fieldset>
  )
}
