import { useRef } from 'react'
import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tab as AriaTab,
} from 'react-aria-components'
import classNames from 'classnames'
import { type TabsProps } from './TabsTypes'
import styles from './Tabs.module.scss'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Tabs({ tabs, selectedId, onSelectionChange, className, ...ariaProps }: TabsProps) {
  const { Select } = useComponentContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const shouldUseDropdown = !breakpoints.includes('small')

  const selectedTab = tabs.find(tab => tab.id === selectedId)

  const selectOptions = tabs.map(tab => ({
    value: tab.id,
    label: typeof tab.label === 'string' ? tab.label : tab.id,
  }))

  return (
    <div ref={containerRef} className={classNames(styles.root, className)}>
      {!shouldUseDropdown ? (
        <AriaTabs
          className={styles.tabsContainer}
          selectedKey={selectedId}
          onSelectionChange={key => {
            if (key) {
              onSelectionChange(key.toString())
            }
          }}
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
      ) : (
        <>
          <Select
            label={ariaProps['aria-label'] || 'Select tab'}
            shouldVisuallyHideLabel={true}
            options={selectOptions}
            value={selectedId}
            onChange={onSelectionChange}
          />

          {selectedTab && (
            <div
              key={selectedTab.id}
              role="tabpanel"
              id={`panel-${selectedTab.id}`}
              aria-labelledby={selectedTab.id}
            >
              {selectedTab.content}
            </div>
          )}
        </>
      )}
    </div>
  )
}
