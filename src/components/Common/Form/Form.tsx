import classNames from 'classnames'
import styles from './Form.module.scss'

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>

export const Form = ({ children, className, ...props }: FormProps) => {
  return (
    <form className={classNames(styles.form, className)} {...props}>
      {children}
    </form>
  )
}
