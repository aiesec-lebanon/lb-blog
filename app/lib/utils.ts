export function truncate(text: string, max = 120) {
  if (!text) return ""
  return text.length > max
    ? text.slice(0, max) + "..."
    : text
}

export function clampBody(text: string, max = 500) {
  if (!text) return ""
  return text.length > max
    ? text.slice(0, max) + "..."
    : text
}

export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleString()
}