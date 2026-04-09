import { useState } from 'react'
import { fn } from 'storybook/test'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import type { useDataViewProp } from '@/components/Common/DataView/useDataView'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export default {
  title: 'UI/Components/DataView',
}

const onSelectAction = fn().mockName('onSelect')

type CompensationRow = (typeof compensationData)[number]

const compensationData = [
  {
    id: '1',
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '2',
    jobTitle: 'Key Holder',
    payType: 'By the hour',
    amount: '$20.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '3',
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '4',
    jobTitle: 'Key Holder',
    payType: 'By the hour',
    amount: '$20.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '5',
    jobTitle: 'Software Engineer',
    payType: 'By the hour',
    amount: '$45.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '6',
    jobTitle: 'Project Manager',
    payType: 'By the hour',
    amount: '$50.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '7',
    jobTitle: 'Data Analyst',
    payType: 'By the hour',
    amount: '$38.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '8',
    jobTitle: 'Sales Associate',
    payType: 'By the hour',
    amount: '$15.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '9',
    jobTitle: 'Graphic Designer',
    payType: 'By the project',
    amount: '$2,000.00',
    payTimePeriod: 'Per project',
  },
  {
    id: '10',
    jobTitle: 'Marketing Specialist',
    payType: 'By the hour',
    amount: '$35.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '11',
    jobTitle: 'Customer Service Representative',
    payType: 'By the hour',
    amount: '$18.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '12',
    jobTitle: 'UX/UI Designer',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '13',
    jobTitle: 'Network Administrator',
    payType: 'By the hour',
    amount: '$42.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '14',
    jobTitle: 'Content Writer',
    payType: 'By the word',
    amount: '$0.15',
    payTimePeriod: 'Per word',
  },
  {
    id: '15',
    jobTitle: 'Data Scientist',
    payType: 'By the hour',
    amount: '$55.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '16',
    jobTitle: 'Web Developer',
    payType: 'By the project',
    amount: '$3,500.00',
    payTimePeriod: 'Per project',
  },
  {
    id: '17',
    jobTitle: 'Human Resources Manager',
    payType: 'By the hour',
    amount: '$48.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '18',
    jobTitle: 'Accountant',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    id: '19',
    jobTitle: 'Legal Advisor',
    payType: 'By the hour',
    amount: '$100.00',
    payTimePeriod: 'Annually',
  },
]

const compensationColumns: useDataViewProp<CompensationRow>['columns'] = [
  { key: 'jobTitle', title: 'Job Title' },
  { key: 'payType', title: 'Pay Type' },
  { key: 'amount', title: 'Amount' },
  { key: 'payTimePeriod', title: 'Pay Time Period' },
]

function useIdSelection<T extends { id: string }>(allData: T[]) {
  const [selectedIds, setSelectedIds] = useState(new Set<string>())

  return {
    selectedIds,
    selectionProps: {
      selectionMode: 'multiple' as const,
      getIsItemSelected: (item: T) => selectedIds.has(item.id),
      onSelect: (item: T, checked: boolean) => {
        setSelectedIds(prev => {
          const next = new Set(prev)
          checked ? next.add(item.id) : next.delete(item.id)
          return next
        })
      },
      onSelectAll: (checked: boolean) => {
        setSelectedIds(checked ? new Set(allData.map(item => item.id)) : new Set())
      },
    },
  }
}

const renderItemMenu = () => (
  <HamburgerMenu
    items={[
      { label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} },
      { label: 'Delete', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
    ]}
  />
)

export const DataViewDefault = () => {
  const dataProps = useDataView({ data: compensationData, columns: compensationColumns })
  return <DataView label="Data View Default" {...dataProps} />
}

export const DataViewSelectableCheckbox = () => {
  const { selectionProps } = useIdSelection(compensationData)
  const dataProps = useDataView({
    data: compensationData,
    columns: compensationColumns,
    ...selectionProps,
  })
  return <DataView label="Data View Selectable (Checkbox - Multi-select)" {...dataProps} />
}

export const DataViewSelectableRadio = () => {
  const dataProps = useDataView({
    data: compensationData,
    columns: compensationColumns,
    onSelect: (item, checked) => onSelectAction({ item, checked }),
    selectionMode: 'single',
  })
  return <DataView label="Data View Selectable (Radio - Single-select)" {...dataProps} />
}

export const DataViewWithMenu = () => {
  const dataProps = useDataView({
    data: compensationData,
    columns: compensationColumns,
    itemMenu: renderItemMenu,
  })
  return <DataView label="Data View with Menu" {...dataProps} />
}

export const DataViewSelectableWithMenu = () => {
  const { selectionProps } = useIdSelection(compensationData)
  const dataProps = useDataView({
    data: compensationData,
    columns: compensationColumns,
    itemMenu: renderItemMenu,
    ...selectionProps,
  })
  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewEmpty = () => {
  const dataProps = useDataView({
    data: [] as typeof compensationData,
    columns: compensationColumns,
    emptyState: () => <div style={{ textAlign: 'center', padding: '1rem' }}>No data available</div>,
  })
  return <DataView label="Data View Empty" {...dataProps} />
}

export const DataViewWithPagination = () => {
  const dataProps = useDataView({
    data: compensationData,
    columns: compensationColumns,
    pagination: {
      currentPage: 1,
      totalPages: 10,
      itemsPerPage: 5,
      handleFirstPage: () => {},
      handlePreviousPage: () => {},
      handleNextPage: () => {},
      handleLastPage: () => {},
      handleItemsPerPageChange: () => {},
    },
  })
  return <DataView label="Data View with Pagination" {...dataProps} />
}

export const DataViewSelectableWithPagination = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<5 | 10 | 50>(5)
  const [selectedIds, setSelectedIds] = useState(new Set<string>())

  const totalPages = Math.ceil(compensationData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const pageData = compensationData.slice(startIndex, startIndex + itemsPerPage)

  const dataProps = useDataView({
    data: pageData,
    columns: compensationColumns,
    selectionMode: 'multiple',
    getIsItemSelected: item => selectedIds.has(item.id),
    onSelect: (item: CompensationRow, checked: boolean) => {
      setSelectedIds(prev => {
        const next = new Set(prev)
        checked ? next.add(item.id) : next.delete(item.id)
        return next
      })
    },
    onSelectAll: checked => {
      setSelectedIds(checked ? new Set(compensationData.map(item => item.id)) : new Set())
    },
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalCount: compensationData.length,
      handleFirstPage: () => {
        setCurrentPage(1)
      },
      handlePreviousPage: () => {
        setCurrentPage(p => Math.max(1, p - 1))
      },
      handleNextPage: () => {
        setCurrentPage(p => Math.min(totalPages, p + 1))
      },
      handleLastPage: () => {
        setCurrentPage(totalPages)
      },
      handleItemsPerPageChange: n => {
        setItemsPerPage(n)
        setCurrentPage(1)
      },
    },
  })

  return (
    <div>
      <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#666' }}>
        {selectedIds.size} of {compensationData.length} selected (across all pages)
      </div>
      <DataView label="Data View Selectable with Pagination" {...dataProps} />
    </div>
  )
}

export const DataViewWithFooter = () => {
  const sampleData = [
    { jobTitle: 'Software Engineer', hourlyRate: 45, hoursWorked: 40 },
    { jobTitle: 'Project Manager', hourlyRate: 50, hoursWorked: 38 },
    { jobTitle: 'Data Analyst', hourlyRate: 38, hoursWorked: 40 },
    { jobTitle: 'UX Designer', hourlyRate: 40, hoursWorked: 35 },
  ]

  const dataProps = useDataView({
    data: sampleData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'hourlyRate', title: 'Hourly Rate', render: item => `$${item.hourlyRate.toFixed(2)}` },
      { key: 'hoursWorked', title: 'Hours Worked' },
      { title: 'Total Pay', render: item => `$${(item.hourlyRate * item.hoursWorked).toFixed(2)}` },
    ],
    footer: () => ({
      jobTitle: 'Total',
      hourlyRate: '$43.25',
      hoursWorked: '153',
      'column-3': '$6,620.00',
    }),
  })

  return <DataView label="Data View with Footer" {...dataProps} />
}
