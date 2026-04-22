import type { ReactNode } from 'react'
import { Skeleton } from '../ContractorProfile/components/Skeleton'
import { DataView, useDataView } from '@/components/Common'

interface Column {
  title: string | ReactNode
  skeletonWidth?: number
}

interface SkeletonDataViewProps<T> {
  label: string
  data: T[]
  columns: {
    title: string | ReactNode
    render: (item: T) => ReactNode
    skeletonWidth?: number
  }[]
  isFetching: boolean
  itemMenu?: (item: T) => ReactNode
  emptyState?: () => ReactNode
  placeholderRows?: number
}

const SKELETON_HEADER_WIDTH = 60
const SKELETON_CELL_WIDTH = 100
const SKELETON_HEIGHT = 16

function useSkeletonColumns(columns: Column[]) {
  return columns.map(col => ({
    title: <Skeleton width={SKELETON_HEADER_WIDTH} height={SKELETON_HEIGHT} />,
    render: () => (
      <Skeleton width={col.skeletonWidth ?? SKELETON_CELL_WIDTH} height={SKELETON_HEIGHT} />
    ),
  }))
}

export function SkeletonDataView<T>({
  label,
  data,
  columns,
  isFetching,
  itemMenu,
  emptyState,
  placeholderRows = 3,
}: SkeletonDataViewProps<T>) {
  const placeholders = Array.from({ length: placeholderRows }) as T[]
  const skeletonColumns = useSkeletonColumns(columns)

  const dataViewProps = useDataView<T>({
    data: isFetching ? placeholders : data,
    columns: isFetching ? skeletonColumns : columns,
    itemMenu: isFetching ? undefined : itemMenu,
    emptyState,
  })

  return <DataView label={label} {...dataViewProps} />
}
