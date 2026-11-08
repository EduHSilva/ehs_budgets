<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { useUser } from '~/plugins/userService'
import { getTokenCookie } from '~/utils/util'

const toast = useToast()
const config = useRuntimeConfig()

type GoogleTokenResponse = {
  credential?: string
}

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (options: {
          client_id: string
          callback: (response: GoogleTokenResponse) => void
          error_callback?: (error: unknown) => void
          auto_select?: boolean
          use_fedcm_for_prompt?: boolean
          cancel_on_tap_outside?: boolean
        }) => void
        prompt: () => void
      }
    }
  }
}

async function ensureGoogleScriptLoaded() {
  if (!import.meta.client) return false
  const w = window as GoogleWindow
  if (w.google?.accounts?.id) return true

  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
  if (existing) {
    await new Promise<void>(resolve => existing.addEventListener('load', () => resolve(), { once: true }))
    return Boolean((window as GoogleWindow).google?.accounts?.id)
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })

  return Boolean((window as GoogleWindow).google?.accounts?.id)
}

async function handleGoogleProviderLogin() {
  if (!import.meta.client) return
  const clientId = config.public.googleClientId
  if (!clientId) {
    console.error('Missing NUXT_PUBLIC_GOOGLE_CLIENT_ID')
    return
  }

  const loaded = await ensureGoogleScriptLoaded()
  if (!loaded) return

  const w = window as GoogleWindow
  w.google?.accounts?.id?.initialize({
    client_id: clientId,
    callback: (response) => {
      const token = response.credential
      if (!token) return
      login(null, null, token)
    },
    auto_select: false,
    use_fedcm_for_prompt: false,
    cancel_on_tap_outside: true
  })

  w.google?.accounts?.id?.prompt()
}

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: $t('email'),
  placeholder: $t('enterEmail'),
  required: true
}, {
  name: 'password',
  label: $t('password'),
  type: 'password',
  placeholder: $t('enterPassword'),
  required: true
}, {
  name: 'remember',
  label: $t('rememberMe'),
  type: 'checkbox'
}]

const providers = [{
  label: $t('auth.google'),
  icon: 'i-simple-icons-google',
  onClick: handleGoogleProviderLogin
}]

const schema = z.object({
  email: z.email($t('errors.invalidEmail')),
  password: z.string($t('errors.required')).min(8, $t('errors.passwordRules'))
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await login(payload.data.email, payload.data.password, null)
}

async function login(email: string | null, password: string | null, tokenGmail: string | null) {
  try {
    const { $userService } = useNuxtApp()
    const data = await $userService.login(email, password, tokenGmail)
    if (!data) {
      toast.add({
        title: $t('attention'),
        description: $t('errors.loginError'),
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      })
    } else {
      const token = getTokenCookie()
      token.value = { token: data.data.token }
      useUser().value = data.data
      navigateTo('/dashboard')
    }
  } catch (e) {
    console.error(e)
    toast.add({
      title: $t('attention'),
      description: $t('errors.loginError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="mx-auto grid min-h-[calc(100vh-12rem)] w-full max-w-6xl items-center gap-6 px-4 py-8 lg:grid-cols-2">
    <UCard class="order-2 lg:order-1 bg-cards dark:bg-cards-dark">
      <template #header>
        <h2 class="font-title text-xl font-bold md:text-2xl">
          {{ $t('auth.loginPanelTitle') }}
        </h2>
      </template>

      <p class="text-sm text-muted">
        {{ $t('auth.loginPanelDescription') }}
      </p>

      <div class="mt-4 space-y-3">
        <div class="rounded-lg border border-default p-3">
          <p class="text-sm font-medium">
            {{ $t('auth.panelPointOneTitle') }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ $t('auth.panelPointOneDescription') }}
          </p>
        </div>
        <div class="rounded-lg border border-default p-3">
          <p class="text-sm font-medium">
            {{ $t('auth.panelPointTwoTitle') }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ $t('auth.panelPointTwoDescription') }}
          </p>
        </div>
        <div class="rounded-lg border border-default p-3">
          <p class="text-sm font-medium">
            {{ $t('auth.panelPointThreeTitle') }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ $t('auth.panelPointThreeDescription') }}
          </p>
        </div>
      </div>
    </UCard>

    <UPageCard class="order-1 w-full max-w-md justify-self-center border-default lg:order-2">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        :title="$t('login')"
        :description="$t('auth.loginSubtitle')"
        :submit="{ label: $t('login') }"
        :separator="$t('or')"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          {{ $t('dontHaveAccount') }}
          <ULink
            to="/auth/register"
            class="text-primary font-medium"
          >
            {{ $t('register') }}
          </ULink>
        </template>

        <template #password-hint>
          <ULink
            to="#"
            class="text-primary font-medium"
            tabindex="-1"
          >
            {{ $t('forgotPassword') }}
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
