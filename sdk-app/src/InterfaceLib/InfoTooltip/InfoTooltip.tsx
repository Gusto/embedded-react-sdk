// eslint-disable-next-line no-restricted-imports
import { Button, Tooltip, TooltipTrigger } from 'react-aria-components'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import styles from './InfoTooltip.module.scss'

interface InfoTooltipProps {
  /**
   * Content to display in the tooltip popover.
   */
  children: ReactNode
  /**
   * Optional accessible label for the trigger button.
   */
  ariaLabel?: string
  className?: string
}

export function InfoTooltip({
  children,
  ariaLabel = 'More information',
  className,
}: InfoTooltipProps) {
  return (
    <TooltipTrigger delay={150} closeDelay={100}>
      <Button aria-label={ariaLabel} className={classNames(styles.trigger, className)}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 0C4.04 0 0 4.04 0 9C0 13.96 4.04 18 9 18C13.96 18 18 13.96 18 9C18 4.04 13.96 0 9 0ZM9 16C5.14 16 2 12.86 2 9C2 5.14 5.14 2 9 2C12.86 2 16 5.14 16 9C16 12.86 12.86 16 9 16ZM8 7.5V14H10V7.5H8ZM10.25 5.25C10.25 5.94036 9.69036 6.5 9 6.5C8.30964 6.5 7.75 5.94036 7.75 5.25C7.75 4.55964 8.30964 4 9 4C9.69036 4 10.25 4.55964 10.25 5.25Z"
            fill="currentColor"
          />
        </svg>
      </Button>
      <Tooltip className={styles.tooltip} offset={6}>
        {children}
      </Tooltip>
    </TooltipTrigger>
  )
}
