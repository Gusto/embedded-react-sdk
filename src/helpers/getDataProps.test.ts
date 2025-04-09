import { expect, describe, it } from 'vitest'
import { getDataProps } from './getDataProps'

describe('getDataProps', () => {
  it('should return empty object for empty input', () => {
    expect(getDataProps({})).toEqual({})
  })

  it('should extract data-* attributes', () => {
    const props = {
      'data-string': 'value',
      'data-bool': true,
      'data-number': 123,
    }
    expect(getDataProps(props)).toEqual(props)
  })

  it('should ignore non-data-* attributes', () => {
    const props = {
      'data-test': 'value',
      className: 'test-class',
      id: 'test-id',
      style: { color: 'red' },
    }
    expect(getDataProps(props)).toEqual({
      'data-test': 'value',
    })
  })

  it('should ignore data-* attributes with invalid value types', () => {
    const props = {
      'data-test': 'value',
      'data-object': { key: 'value' },
      'data-array': [1, 2, 3],
      'data-null': null,
      'data-undefined': undefined,
    }
    expect(getDataProps(props)).toEqual({
      'data-test': 'value',
    })
  })
})
