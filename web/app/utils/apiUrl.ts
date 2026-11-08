export function apiOrigin() {
  return import.meta.client ? window.location.origin : ''
}

export function resolveApiUrl(baseUrl: string) {
  if (!import.meta.client) return baseUrl

  try {
    const current = new URL(window.location.href)
    const target = new URL(baseUrl)

    if (current.protocol === 'https:' && target.protocol === 'http:') {
      target.protocol = 'https:'
      return target.toString()
    }
  } catch {
    return baseUrl
  }

  return baseUrl
}
