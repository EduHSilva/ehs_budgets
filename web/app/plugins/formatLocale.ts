/**
 * Mantém `formatCurrency` alinhado ao idioma da interface: pt → BRL, en → USD.
 * O util não pode depender de composables (é chamado dentro de render/computed),
 * então o locale é espelhado em uma variável de módulo.
 *
 * Plugins não têm contexto de setup, então `useI18n()` lança MUST_BE_CALL_SETUP_TOP
 * (vue-i18n 11). Usamos a instância exposta pelo módulo em `$i18n`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as unknown as { locale: Ref<string> } | undefined

  if (!i18n) {
    return
  }

  setFormatLocale(i18n.locale.value)
  watch(i18n.locale, value => setFormatLocale(value))
})
