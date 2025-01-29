import { useMemo, useRef } from 'react'
import { DataTable } from '@/components/Common/DataView/DataTable/DataTable'
import { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { DataCards } from '@/components/Common/DataView/DataCards/DataCards'
import { PaginationControl } from '@/components/Common/PaginationControl/PaginationControl'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

export type DataViewProps<T> = {
  columns: useDataViewPropReturn<T>['columns']
  data: T[]
  pagination?: useDataViewPropReturn<T>['pagination']
  label: string
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
}

export const DataView = <T,>({ pagination, ...dataViewProps }: DataViewProps<T>) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
    breakpoints: {
      small: 32,
    },
  })

  const isMobile =
    !breakpoints.includes('small') &&
    !breakpoints.includes('medium') &&
    !breakpoints.includes('large')

  const Component = useMemo(() => {
    return isMobile ? DataCards : DataTable
  }, [isMobile])

  return (
    <div
      ref={ref => {
        containerRef.current = ref
      }}
    >
      <Component {...dataViewProps} />
      {pagination && <PaginationControl {...pagination} />}
    </div>
  )
}
