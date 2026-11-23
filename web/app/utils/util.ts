export function getTokenCookie() {
  // Persistente: sem maxAge o cookie morria ao fechar o navegador. A validade real
  // da sessão é a do JWT, renovada por `/users/auth/me` a cada carregamento.
  return useCookie<{ token: string | null } | null>('token', { maxAge: 60 * 60 * 24 * 30 })
}

export function formatCurrency(value: number) {
  const locale = navigator == undefined ? '' : navigator.language
  if (locale == 'en') {
    return 'U$ ' + value.toFixed(2)
  }
  return 'R$ ' + value.toFixed(2)
}
