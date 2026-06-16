import classNames from 'classnames'
import styles from './Form.module.scss'

/** @internal */
export type FormProps = React.FormHTMLAttributes<HTMLFormElement>

/** @internal */
export const Form = ({ children, className, onSubmit, noValidate = true, ...props }: FormProps) => {
  return (
    <form
      className={classNames(styles.form, className)}
      noValidate={noValidate}
      onSubmit={e => {
        e.preventDefault()
        onSubmit?.(e)
      }}
      {...props}
    >
      {children}
    </form>
  )
}
