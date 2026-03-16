import classNames from 'classnames'
import styles from '@/components/Common/Form/Form.module.scss'

interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (e: React.SubmitEvent<HTMLFormElement>) => void | Promise<void>
}

export function Form({ children, className, onSubmit, ...props }: FormProps) {
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    void onSubmit?.(e)
  }

  return (
    <form className={classNames(styles.form, className)} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  )
}
