import { useCallback, useMemo } from 'react'

export type ConvertValueToString<TValue> = (value: TValue) => string

export type OptionWithGenericValue<TValue, TOption> = Omit<TOption, 'value'> & {
  value: TValue
}

interface UseStringifyOptionValuesProps<TValue, TOption> {
  options: OptionWithGenericValue<TValue, TOption>[]
  convertValueToString?: ConvertValueToString<TValue>
}

const defaultConvertValueToString = (value: unknown) => String(value)

function useStringifyOptionValues<TValue, TOption>({
  options,
  convertValueToString = defaultConvertValueToString,
}: UseStringifyOptionValuesProps<TValue, TOption>) {
  return useMemo(() => {
    const optionValuesMap: Record<string, OptionWithGenericValue<TValue, TOption>> = {}
    const optionsWithStringValues = []

    for (const option of options) {
      const stringValue = convertValueToString(option.value)
      optionValuesMap[stringValue] = option
      const { value, ...restOptionsProps } = option

      optionsWithStringValues.push({
        value: stringValue,
        ...restOptionsProps,
      })
    }

    return { optionValuesMap, options: optionsWithStringValues }
  }, [options, convertValueToString])
}

interface UseStringifyGenericFieldValueProps<TValue, TOption> {
  options: OptionWithGenericValue<TValue, TOption>[]
  value?: TValue
  onChange: (value: TValue) => void
  convertValueToString?: ConvertValueToString<TValue>
}

export function useStringifyGenericFieldValue<TValue, TOption>({
  options,
  value,
  onChange,
  convertValueToString = defaultConvertValueToString,
}: UseStringifyGenericFieldValueProps<TValue, TOption>) {
  const { optionValuesMap, options: optionsWithStringValues } = useStringifyOptionValues({
    options,
    convertValueToString,
  })

  const handleChange = useCallback(
    (value: string) => {
      const originalValue = optionValuesMap[value]?.value
      if (typeof originalValue !== 'undefined') {
        onChange(originalValue)
      }
    },
    [optionValuesMap, onChange],
  )

  const stringValue =
    value === null || typeof value === 'undefined' ? undefined : convertValueToString(value)

  return {
    options: optionsWithStringValues,
    value: stringValue,
    onChange: handleChange,
  }
}

interface UseStringifyGenericFieldValueArrayProps<TValue, TOption> {
  options: OptionWithGenericValue<TValue, TOption>[]
  value?: TValue[]
  onChange: (value: TValue[]) => void
  convertValueToString?: ConvertValueToString<TValue>
}

export function useStringifyGenericFieldValueArray<TValue, TOption>({
  options,
  value,
  onChange,
  convertValueToString = defaultConvertValueToString,
}: UseStringifyGenericFieldValueArrayProps<TValue, TOption>) {
  const { optionValuesMap, options: optionsWithStringValues } = useStringifyOptionValues({
    options,
    convertValueToString,
  })

  const handleChange = useCallback(
    (updatedStringValue: string[]) => {
      const updatedValues = []

      for (const stringValue of updatedStringValue) {
        const value = optionValuesMap[stringValue]?.value

        if (typeof value !== 'undefined') {
          updatedValues.push(value)
        }
      }

      onChange(updatedValues)
    },
    [optionValuesMap, onChange],
  )

  const stringValue = value ? value.map(convertValueToString) : value

  return {
    options: optionsWithStringValues,
    value: stringValue,
    onChange: handleChange,
  }
}
