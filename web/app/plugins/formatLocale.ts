/**
 * Mantém `formatCurrency` alinhado ao idioma da interface: pt → BRL, en → USD.
 * O util não pode depender de composables (é chamado dentro de render/computed),
 * então o locale é espelhado em uma variável de módulo.
 */
export default defineNuxtPlugin(() => {
  const { locale } = useI18n()

  setFormatLocale(locale.value)
  watch(locale, value => setFormatLocale(value))
})
