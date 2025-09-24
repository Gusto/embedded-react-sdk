import { useMemo, useRef } from 'react'
import { PaginationControl } from '../PaginationControl/PaginationControl'
import type { TableProps } from '../UI/Table/TableTypes'
import styles from './DataView.module.scss'
import { DataTable } from './DataTable/DataTable'
import type { useDataViewPropReturn } from './useDataView'
import { DataCards } from './DataCards/DataCards'
import type { useContainerBreakpointsProps } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

export type DataViewProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: T[]
  pagination?: useDataViewPropReturn<T>['pagination']
  label: string
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  breakAt?: string
  breakpoints?: useContainerBreakpointsProps['breakpoints']
  footer?: useDataViewPropReturn<T>['footer']
  isFetching?: boolean
  variant?: TableProps['variant']
}

export const DataView = <T,>({
  pagination,
  isFetching,
  breakAt = 'small',
  breakpoints: customBreakpoints,
  footer,
  variant,
  ...dataViewProps
}: DataViewProps<T>) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
    breakpoints: customBreakpoints,
  })

  // Wait for breakpoints to be detected before rendering
  const isBreakpointsDetected = breakpoints.length > 0
  const isMobile = !breakpoints.includes(breakAt)

  const Component = useMemo(() => {
    return isMobile ? DataCards : DataTable
  }, [isMobile])

  return (
    <div
      data-testid="data-view"
      className={styles.dataViewContainer}
      ref={ref => {
        containerRef.current = ref
      }}
    >
      {isBreakpointsDetected && <Component {...dataViewProps} footer={footer} variant={variant} />}
      {pagination && <PaginationControl {...pagination} isFetching={isFetching} />}
    </div>
  )
}
