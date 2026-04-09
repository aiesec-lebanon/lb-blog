export async function readBackendError(response: Response) {
  try {
    const data = await response.json()

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message
    }
  } catch {
    // Fall through to text parsing.
  }

  try {
    const text = await response.text()

    if (text.trim()) {
      return text
    }
  } catch {
    // Ignore text parsing failures.
  }

  return `Request failed with status ${response.status}`
}
