import { Menu as AriaMenu, MenuItem as AriaMenuItem, Popover } from 'react-aria-components'
import styles from './Menu.module.scss'
import { type MenuProps, MenuDefaults } from './MenuTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useTheme } from '@/contexts/ThemeProvider'

export function Menu(rawProps: MenuProps) {
  const resolvedProps = applyMissingDefaults(rawProps, MenuDefaults)
  const {
    triggerRef,
    items,
    isOpen,
    onClose,
    'aria-label': ariaLabel,
    ...otherProps
  } = resolvedProps
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
      <AriaMenu onClose={onClose} aria-label={ariaLabel} className={styles.root} {...otherProps}>
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
