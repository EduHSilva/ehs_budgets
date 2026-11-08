export function getTokenCookie() {
  return useCookie<{ token: string | null } | null>('token')
}

export function formatCurrency(value: number) {
  const locale = navigator == undefined ? '' : navigator.language
  if (locale == 'en') {
    return 'U$ ' + value.toFixed(2)
  }
  return 'R$ ' + value.toFixed(2)
}
