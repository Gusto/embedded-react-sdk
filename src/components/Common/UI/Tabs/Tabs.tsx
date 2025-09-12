import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tab as AriaTab,
} from 'react-aria-components'
import classNames from 'classnames'
import { type TabsProps } from './TabsTypes'
import styles from './Tabs.module.scss'

/**
 * Tabs component that provides a simple object-based interface to React Aria Tabs
 * This allows consumers to provide tabs as an array of objects with content and events
 */
export function Tabs({
  tabs,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className,
  id,
  ...ariaProps
}: TabsProps) {
  return (
    <AriaTabs
      className={classNames(styles.root, className)}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={key => {
        if (key && onSelectionChange) {
          onSelectionChange(key.toString())
        }
      }}
      id={id}
      {...ariaProps}
    >
      <AriaTabList>
        {tabs.map(tab => (
          <AriaTab key={tab.id} id={tab.id} isDisabled={tab.isDisabled}>
            {tab.label}
          </AriaTab>
        ))}
      </AriaTabList>

      {tabs.map(tab => (
        <AriaTabPanel key={tab.id} id={tab.id}>
          {tab.content}
        </AriaTabPanel>
      ))}
    </AriaTabs>
  )
}
