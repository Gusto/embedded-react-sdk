import { useMemo, useRef } from 'react'
import styles from './DataView.module.scss'
import { DataTable } from '@/components/Common/DataView/DataTable/DataTable'
import { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { DataCards } from '@/components/Common/DataView/DataCards/DataCards'
import { PaginationControl } from '@/components/Common/PaginationControl/PaginationControl'
import useContainerBreakpoints, {
  BreakpointKey,
} from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

export type DataViewProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: T[]
  pagination?: useDataViewPropReturn<T>['pagination']
  label: string
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  breakAt?: BreakpointKey
}

export const DataView = <T,>({
  pagination,
  breakAt = 'small',
  ...dataViewProps
}: DataViewProps<T>) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
  })

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
      <Component {...dataViewProps} />
      {pagination && <PaginationControl {...pagination} />}
    </div>
  )
}
