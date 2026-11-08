<script setup>
import { useUser } from '~/plugins/userService.ts'

const { locale, setLocale } = useI18n()

const router = useRouter()

const handleLogout = () => {
  useUser().value = null
  router.push('/')
}
</script>

<template>
  <header class="print:hidden border-b border-default bg-default/60 px-3 py-2 backdrop-blur">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
      <NuxtLink
        class="flex items-center gap-2"
        :to="useUser().value ? '/dashboard' : '/'"
      >
        <div class="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <UIcon
            name="i-lucide-shield-check"
            class="size-4"
          />
        </div>
        <div class="leading-tight">
          <p class="text-[11px] font-medium uppercase tracking-wide text-muted">
            EHS Solutions
          </p>
          <p class="font-title text-sm font-bold md:text-base">
            EHS Orçamentos
          </p>
        </div>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <UColorModeButton />
        <div class="hidden items-center gap-1 sm:flex">
          <UButton
            size="xs"
            :variant="locale === 'pt' ? 'solid' : 'ghost'"
            color="neutral"
            label="PT"
            @click="setLocale('pt')"
          />
          <UButton
            size="xs"
            :variant="locale === 'en' ? 'solid' : 'ghost'"
            color="neutral"
            label="EN"
            @click="setLocale('en')"
          />
        </div>

        <UButton
          v-if="!useUser().value"
          to="/auth/login"
          class="bg-primary dark:bg-primary-dark"
          size="sm"
        >
          {{ $t('login') }}
        </UButton>
        <UButton
          v-if="!useUser().value"
          to="/auth/register"
          variant="outline"
          size="sm"
          class="hidden sm:inline-flex"
        >
          {{ $t('register') }}
        </UButton>

        <UButton
          v-if="useUser().value != null"
          class="bg-primary dark:bg-primary-dark"
          size="sm"
          icon="i-lucide-log-out"
          :label="$t('logout')"
          @click="handleLogout"
        />
      </div>
    </div>
  </header>
</template>
