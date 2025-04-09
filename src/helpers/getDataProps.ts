import type { DataAttributes } from '@/types/Helpers'

type DataAttributeEntry = [key: keyof DataAttributes, value: DataAttributes[keyof DataAttributes]]

const isDataProp = (entry: [string, unknown]): entry is DataAttributeEntry => {
  const [key, value] = entry
  return (
    key.startsWith('data-') &&
    (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  )
}

export function getDataProps(props: Record<string, unknown>): DataAttributes {
  const result: DataAttributes = {}

  Object.entries(props).forEach(entry => {
    if (isDataProp(entry)) {
      const [key, value] = entry
      result[key] = value
    }
  })

  return result
}
