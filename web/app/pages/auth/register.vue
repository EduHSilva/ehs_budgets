<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: $t('email'),
  placeholder: $t('enterEmail'),
  required: true
}, {
  name: 'username',
  label: $t('username'),
  type: 'text',
  placeholder: $t('enterUsername'),
  required: true
}, {
  name: 'password',
  label: $t('password'),
  type: 'password',
  placeholder: $t('enterPassword'),
  required: true
}]

const schema = z.object({
  email: z.email($t('errors.invalidEmail')),
  username: z.string($t('errors.required')),
  password: z.string($t('errors.required')).min(8, $t('errors.passwordRules'))
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { $userService } = useNuxtApp()
  try {
    const data = await $userService.register(payload.data.username, payload.data.email, payload.data.password)
    if (!data) {
      toast.add({
        title: $t('attention'),
        description: $t('errors.registerError'),
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      })
    } else {
      toast.add({
        title: $t('success'),
        description: $t('auth.registerSuccess'),
        icon: 'i-lucide-check-circle-2',
        color: 'success'
      })
      navigateTo('/auth/login')
    }
  } catch (e) {
    toast.add({
      title: $t('attention'),
      description: $t('errors.registerError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    console.error(e)
  }
}
</script>

<template>
  <div class="mx-auto grid min-h-[calc(100vh-12rem)] w-full max-w-6xl items-center gap-6 px-4 py-8 lg:grid-cols-2">
    <UCard class="order-2 lg:order-1 bg-cards dark:bg-cards-dark">
      <template #header>
        <h2 class="font-title text-xl font-bold md:text-2xl">
          {{ $t('auth.registerPanelTitle') }}
        </h2>
      </template>

      <p class="text-sm text-muted">
        {{ $t('auth.registerPanelDescription') }}
      </p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-default p-3">
          <p class="text-sm text-muted">
            {{ $t('auth.registerStatOne') }}
          </p>
          <p class="mt-1 text-lg font-bold">
            5 min
          </p>
        </div>
        <div class="rounded-lg border border-default p-3">
          <p class="text-sm text-muted">
            {{ $t('auth.registerStatTwo') }}
          </p>
          <p class="mt-1 text-lg font-bold">
            100%
          </p>
        </div>
        <div class="rounded-lg border border-default p-3 sm:col-span-2">
          <p class="text-sm font-medium">
            {{ $t('auth.registerHintTitle') }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ $t('auth.registerHintDescription') }}
          </p>
        </div>
      </div>
    </UCard>

    <UPageCard class="order-1 w-full max-w-md justify-self-center border-default lg:order-2">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :title="$t('register')"
        :description="$t('auth.registerSubtitle')"
        icon="i-lucide-lock"
        :submit="{ label: $t('register') }"
        @submit="onSubmit"
      >
        <template #description>
          {{ $t('haveAccount') }}
          <ULink
            to="/auth/login"
            class="text-primary font-medium"
          >
            {{ $t('login') }}
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
