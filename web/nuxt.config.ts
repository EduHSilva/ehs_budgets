// https://nuxt.com/docs/api/configuration/nuxt-config

const appBaseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    baseURL: appBaseURL
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'pt',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'pt', name: 'Pt', file: 'pt.json' }
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    manifest: {
      name: 'EHS Orçamentos — EHS Solutions',
      short_name: 'EHS Orçamentos',
      description: 'Plataforma da EHS Solutions para orçamentos, clientes, kanban e lembretes.',
      theme_color: '#4F46E5',
      background_color: '#FAFAFA',
      display: 'standalone',
      orientation: 'portrait',
      scope: appBaseURL,
      start_url: `${appBaseURL}dashboard`,
      icons: [
        {
          src: `${appBaseURL}icons/pwa-192x192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: `${appBaseURL}icons/pwa-512x512.png`,
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: `${appBaseURL}icons/pwa-maskable-512x512.png`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkOnly',
          method: 'GET'
        },
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkOnly',
          method: 'POST'
        },
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkOnly',
          method: 'PUT'
        },
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkOnly',
          method: 'DELETE'
        }
      ]
    }
  }
})
