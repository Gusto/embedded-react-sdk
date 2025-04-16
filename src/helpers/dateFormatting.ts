export const formatDateNamedWeekdayShortPlusDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const formateDateToStringDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}
