import { Menu as AriaMenu, MenuItem as AriaMenuItem, Popover } from 'react-aria-components'
import styles from './Menu.module.scss'
import { type MenuProps } from './MenuTypes'
import { useTheme } from '@/contexts/ThemeProvider'

export function Menu({
  triggerRef,
  items,
  isOpen = false,
  onClose,
  'aria-label': ariaLabel,
  ...props
}: MenuProps) {
  const { container } = useTheme()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose?.()
    }
  }

  return (
    <Popover
      UNSTABLE_portalContainer={container.current}
      onOpenChange={handleOpenChange}
      isOpen={isOpen}
      triggerRef={triggerRef}
      placement="bottom start"
      offset={8}
      shouldUpdatePosition={true}
    >
      <AriaMenu onClose={onClose} aria-label={ariaLabel} className={styles.root} {...props}>
        {items?.map(({ onClick, isDisabled, href, icon, label, ...itemProps }, index) => (
          <AriaMenuItem
            key={index}
            onAction={() => {
              onClick()
            }}
            isDisabled={isDisabled}
            href={href}
            className={styles.menuItem}
            {...itemProps}
          >
            {icon && <div className={styles.menuIcon}>{icon}</div>}
            {label}
          </AriaMenuItem>
        ))}
      </AriaMenu>
    </Popover>
  )
}
