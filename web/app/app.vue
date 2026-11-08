<script setup>
import CustomHeader from '~/components/CustomHeader.vue'

const appBase = useRuntimeConfig().app.baseURL

useHead({
  titleTemplate: title => (title ? `${title} · EHS Orçamentos` : 'EHS Orçamentos — EHS Solutions'),
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#4F46E5' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'EHS Orçamentos' },
    { name: 'google-signin-client_id', content: '955111681226-htvif7bd6os7fd84jl4ucae21fh0phh3.apps.googleusercontent.com' }

  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: `${appBase}favicon.svg` },
    { rel: 'icon', href: `${appBase}favicon.ico`, sizes: '32x32' },
    { rel: 'apple-touch-icon', href: `${appBase}apple-touch-icon.png` }
  ],
  htmlAttrs: {
    lang: 'pt-BR'
  }
})

const title = 'EHS Orçamentos — EHS Solutions'
const description = 'Plataforma da EHS Solutions para orçamentos, clientes, kanban e lembretes.'

useSeoMeta({
  description,
  ogTitle: title,
  ogDescription: description,
  ogLocale: 'pt_BR'
})
</script>

<template>
  <div>
    <CustomHeader />
    <NuxtPage />
    <footer class="border-t border-default px-4 py-3 text-sm text-muted">
      EHS Solutions • EHS Orçamentos • © {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>
