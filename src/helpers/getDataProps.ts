import type { DataAttributes } from '@/types/Helpers'

type DataAttributeEntry = [key: keyof DataAttributes, value: DataAttributes[keyof DataAttributes]]

const isDataProp = (entry: [string, unknown]): entry is DataAttributeEntry => {
  const [key, value] = entry
  return (
    key.startsWith('data-') &&
    (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  )
}

/**
 * Extracts `data-*` attributes from a props object for forwarding to the DOM.
 *
 * @remarks Filters out any entry whose key does not begin with `data-` or
 * whose value is not a string, number, or boolean — matching the runtime
 * shape that React permits on host elements.
 *
 * @param props - The component props to filter.
 * @returns An object containing only the `data-*` attributes from `props`.
 * @internal
 */
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
