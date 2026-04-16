import classNames from 'classnames'
import styles from './Form.module.scss'

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>

export const Form = ({ children, className, onSubmit, ...props }: FormProps) => {
  return (
    <form
      className={classNames(styles.form, className)}
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
