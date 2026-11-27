export function getTokenCookie() {
  // Persistente: sem maxAge o cookie morria ao fechar o navegador. A validade real
  // da sessão é a do JWT, renovada por `/users/auth/me` a cada carregamento.
  return useCookie<{ token: string | null } | null>('token', { maxAge: 60 * 60 * 24 * 30 })
}

// Espelhado a partir do i18n pelo plugin `formatLocale` (pt → BRL, en → USD).
let currencyLocale: 'pt' | 'en' = 'pt'

export function setFormatLocale(locale?: string | null) {
  currencyLocale = locale === 'en' ? 'en' : 'pt'
}

export function currentCurrency() {
  return currencyLocale === 'en' ? 'USD' : 'BRL'
}

export function formatCurrency(value: number) {
  const amount = Number.isFinite(value) ? value : 0
  const locale = currencyLocale === 'en' ? 'en-US' : 'pt-BR'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currentCurrency()
  }).format(amount)
}
