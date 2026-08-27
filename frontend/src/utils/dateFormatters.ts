/** Format a Date as DD-MM-YYYY. */
export function formatDateDdMmYyyy(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/** Format a Date as DD-MM-YYYY h:mm AM/PM. */
export function formatDateTimeDdMmYyyy12h(date: Date): string {
  const datePart = formatDateDdMmYyyy(date)
  let hour = date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${datePart} ${hour}:${minute} ${ampm}`
}

export function formatIsoDateDdMmYyyy(iso: string | null | undefined): string {
  if (!iso) return ''
  return formatDateDdMmYyyy(new Date(iso))
}

export function formatIsoDateTimeDdMmYyyy12h(iso: string | null | undefined): string {
  if (!iso) return ''
  return formatDateTimeDdMmYyyy12h(new Date(iso))
}
