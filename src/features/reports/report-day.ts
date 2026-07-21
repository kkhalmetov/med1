export function isSameLocalDay(value: string | Date | null | undefined, reference = new Date()) {
  if (!value) return false
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return false

  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  )
}
