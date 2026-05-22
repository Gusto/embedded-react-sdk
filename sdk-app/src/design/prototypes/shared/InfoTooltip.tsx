import { Tooltip, TooltipTrigger, Button as AriaButton } from 'react-aria-components'
import InfoIcon from '@/assets/icons/info.svg?react'
import styles from './InfoTooltip.module.scss'

interface InfoTooltipProps {
  children: React.ReactNode
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <TooltipTrigger delay={200} closeDelay={100}>
      <AriaButton className={styles.trigger} aria-label="More information">
        <InfoIcon aria-hidden className={styles.icon} />
      </AriaButton>
      <Tooltip className={styles.tooltip} placement="top">
        {children}
      </Tooltip>
    </TooltipTrigger>
  )
}
