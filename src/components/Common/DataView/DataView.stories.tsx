import { useState } from 'react'
import { fn } from 'storybook/test'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export default {
  title: 'UI/Components/DataView',
}

const onSelectAction = fn().mockName('onSelect')

const compensationData = [
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  { jobTitle: 'Key Holder', payType: 'By the hour', amount: '$20.00', payTimePeriod: 'Annually' },
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Key Holder',
    payType: 'By the hour',
    amount: '$20.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Software Engineer',
    payType: 'By the hour',
    amount: '$45.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Project Manager',
    payType: 'By the hour',
    amount: '$50.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Data Analyst',
    payType: 'By the hour',
    amount: '$38.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Sales Associate',
    payType: 'By the hour',
    amount: '$15.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Graphic Designer',
    payType: 'By the project',
    amount: '$2,000.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Marketing Specialist',
    payType: 'By the hour',
    amount: '$35.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Customer Service Representative',
    payType: 'By the hour',
    amount: '$18.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'UX/UI Designer',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Network Administrator',
    payType: 'By the hour',
    amount: '$42.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Content Writer',
    payType: 'By the word',
    amount: '$0.15',
    payTimePeriod: 'Per word',
  },
  {
    jobTitle: 'Data Scientist',
    payType: 'By the hour',
    amount: '$55.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Web Developer',
    payType: 'By the project',
    amount: '$3,500.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Human Resources Manager',
    payType: 'By the hour',
    amount: '$48.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Accountant',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Legal Advisor',
    payType: 'By the hour',
    amount: '$100.00',
    payTimePeriod: 'Annually',
  },
]

export const DataViewDefault = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
  })

  return <DataView label="Data View Default" {...dataProps} />
}

export const DataViewSelectableCheckbox = () => {
  const [selectedIndices, setSelectedIndices] = useState(new Set<number>())

  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    selectionMode: 'multiple',
    isItemSelected: (_item, index) => selectedIndices.has(index),
    onSelect: (item, checked) => {
      const index = compensationData.indexOf(item)
      setSelectedIndices(prev => {
        const next = new Set(prev)
        if (checked) {
          next.add(index)
        } else {
          next.delete(index)
        }
        return next
      })
    },
    onSelectAll: checked => {
      if (checked) {
        setSelectedIndices(new Set(compensationData.map((_, i) => i)))
      } else {
        setSelectedIndices(new Set())
      }
    },
  })

  return <DataView label="Data View Selectable (Checkbox - Multi-select)" {...dataProps} />
}

export const DataViewSelectableRadio = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    onSelect: (item, checked) => {
      onSelectAction({ item, checked })
    },
    selectionMode: 'single',
  })

  return <DataView label="Data View Selectable (Radio - Single-select)" {...dataProps} />
}

export const DataViewWithMenu = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: () => {
      return (
        <HamburgerMenu
          items={[
            { label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} },
            { label: 'Delete', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
          ]}
        />
      )
    },
  })

  return <DataView label="Data View with Menu" {...dataProps} />
}

export const DataViewSelectableWithMenu = () => {
  const [selectedIndices, setSelectedIndices] = useState(new Set<number>())

  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: () => {
      return (
        <HamburgerMenu
          items={[
            { label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: () => {} },
            { label: 'Delete', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
          ]}
        />
      )
    },
    selectionMode: 'multiple',
    isItemSelected: (_item, index) => selectedIndices.has(index),
    onSelect: (item, checked) => {
      const index = compensationData.indexOf(item)
      setSelectedIndices(prev => {
        const next = new Set(prev)
        if (checked) {
          next.add(index)
        } else {
          next.delete(index)
        }
        return next
      })
    },
    onSelectAll: checked => {
      if (checked) {
        setSelectedIndices(new Set(compensationData.map((_, i) => i)))
      } else {
        setSelectedIndices(new Set())
      }
    },
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewEmpty = () => {
  const { ...dataProps } = useDataView({
    data: [] as typeof compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    emptyState: () => <div style={{ textAlign: 'center', padding: '1rem' }}>No data available</div>,
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewWithPagination = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
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
  const [selectedIndices, setSelectedIndices] = useState(new Set<number>())

  const totalPages = Math.ceil(compensationData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const pageData = compensationData.slice(startIndex, startIndex + itemsPerPage)

  const { ...dataProps } = useDataView({
    data: pageData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    selectionMode: 'multiple',
    isItemSelected: (_item, index) => selectedIndices.has(startIndex + index),
    onSelect: (_item, checked) => {
      const globalIndex = startIndex + pageData.indexOf(_item)
      setSelectedIndices(prev => {
        const next = new Set(prev)
        if (checked) {
          next.add(globalIndex)
        } else {
          next.delete(globalIndex)
        }
        return next
      })
    },
    onSelectAll: checked => {
      if (checked) {
        setSelectedIndices(new Set(compensationData.map((_, i) => i)))
      } else {
        setSelectedIndices(new Set())
      }
    },
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalCount: compensationData.length,
      handleFirstPage: () => { setCurrentPage(1); },
      handlePreviousPage: () => { setCurrentPage(p => Math.max(1, p - 1)); },
      handleNextPage: () => { setCurrentPage(p => Math.min(totalPages, p + 1)); },
      handleLastPage: () => { setCurrentPage(totalPages); },
      handleItemsPerPageChange: n => {
        setItemsPerPage(n)
        setCurrentPage(1)
      },
    },
  })

  return (
    <div>
      <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#666' }}>
        {selectedIndices.size} of {compensationData.length} selected (across all pages)
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

  const { ...dataProps } = useDataView({
    data: sampleData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      {
        key: 'hourlyRate',
        title: 'Hourly Rate',
        render: item => `$${item.hourlyRate.toFixed(2)}`,
      },
      { key: 'hoursWorked', title: 'Hours Worked' },
      {
        title: 'Total Pay',
        render: item => `$${(item.hourlyRate * item.hoursWorked).toFixed(2)}`,
      },
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
