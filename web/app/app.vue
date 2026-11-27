<script setup>
import CustomHeader from '~/components/CustomHeader.vue'

const appBase = useRuntimeConfig().app.baseURL
const { locale } = useI18n()

useHead({
  titleTemplate: title => (title ? `${title} · Orçamentos` : 'Orçamentos — EHS Solutions'),
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#2F5FA8' },
    { name: 'google-signin-client_id', content: '955111681226-htvif7bd6os7fd84jl4ucae21fh0phh3.apps.googleusercontent.com' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: `${appBase}favicon.svg` },
    { rel: 'icon', href: `${appBase}favicon.ico`, sizes: '32x32' },
    { rel: 'apple-touch-icon', href: `${appBase}apple-touch-icon.png` }
  ],
  htmlAttrs: {
    lang: computed(() => locale.value === 'en' ? 'en-US' : 'pt-BR')
  }
})

const title = 'Orçamentos — EHS Solutions'
const description = 'Plataforma da EHS Solutions para orçamentos, clientes, kanban e lembretes.'

useSeoMeta({
  description,
  ogTitle: title,
  ogDescription: description,
  ogLocale: 'pt_BR'
})
</script>

<template>
  <div class="min-h-screen bg-default text-default">
    <CustomHeader />
    <NuxtPage />
    <footer class="border-t border-default bg-elevated/40 px-4 py-3 text-sm text-muted">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span>Orçamentos • Desenvolvido por EHS Solutions • © {{ new Date().getFullYear() }}</span>
        <a href="/app/privacidade/" class="text-primary hover:underline">{{ $t('privacyPolicy') }}</a>
      </div>
    </footer>
  </div>
</template>
