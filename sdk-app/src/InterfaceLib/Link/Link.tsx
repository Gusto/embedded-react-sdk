import classNames from 'classnames'
import type { LinkProps } from '@gusto/embedded-react-sdk'
import styles from './Link.module.scss'

export function Link({
  href,
  target,
  rel,
  download,
  className,
  id,
  onKeyDown,
  onKeyUp,
  title,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: LinkProps) {
  return (
    <a
      id={id}
      href={href}
      target={target}
      rel={rel}
      download={download}
      title={title}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={classNames(styles.root, className)}
    >
      {children}
    </a>
  )
}
