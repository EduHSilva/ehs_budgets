<script setup>
import { useUser } from '~/plugins/userService.ts'

const { locale, setLocale } = useI18n()

const router = useRouter()
const route = useRoute()
const user = useUser()

const handleLogout = () => {
  user.value = null
  isMenuOpen.value = false
  router.push('/')
}

const isMenuOpen = ref(false)

// O painel de navegação mobile é recolhido a cada troca de rota.
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

const navigation = computed(() => [
  { label: $t('dashboard'), to: '/dashboard', icon: 'i-lucide-house' },
  { label: $t('clients'), to: '/clients', icon: 'i-lucide-users' },
  { label: $t('budgets'), to: '/budgets', icon: 'i-lucide-notebook' },
  { label: $t('kanban.title'), to: '/kanban', icon: 'i-lucide-kanban' },
  { label: $t('reminders'), to: '/reminders', icon: 'i-lucide-bell-dot' },
  { label: $t('account'), to: '/settings/account', icon: 'i-lucide-circle-user' }
])

const isActive = path => route.path === path || route.path.startsWith(`${path}/`)
</script>

<template>
  <header class="print:hidden border-b border-default bg-default/85 px-3 py-2 backdrop-blur">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-1">
        <UButton
          v-if="user"
          class="lg:hidden"
          color="neutral"
          variant="ghost"
          size="sm"
          :icon="isMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          :aria-label="isMenuOpen ? $t('closeMenu') : $t('openMenu')"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        />

        <NuxtLink
          class="flex min-w-0 items-center gap-2"
          :to="user ? '/dashboard' : '/'"
        >
          <div class="ehs-brand-icon flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
            <UIcon
              name="i-lucide-shield-check"
              class="size-4"
            />
          </div>
          <div class="min-w-0 leading-tight">
            <p class="hidden text-[11px] font-medium uppercase tracking-wide text-muted min-[400px]:block">
              EHS Solutions
            </p>
            <p class="truncate font-heading text-base font-semibold tracking-[-0.01em] md:text-lg">
              Orçamentos
            </p>
          </div>
        </NuxtLink>
      </div>

      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <UColorModeButton size="sm" />
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

        <template v-if="!user">
          <UButton
            to="/auth/login"
            class="ehs-btn-primary"
            size="sm"
          >
            {{ $t('login') }}
          </UButton>
          <UButton
            to="/auth/register"
            variant="outline"
            size="sm"
            class="hidden sm:inline-flex"
          >
            {{ $t('register') }}
          </UButton>
        </template>

        <UButton
          v-else
          class="ehs-btn-primary"
          size="sm"
          icon="i-lucide-log-out"
          :aria-label="$t('logout')"
          @click="handleLogout"
        >
          <span class="hidden sm:inline">{{ $t('logout') }}</span>
        </UButton>
      </div>
    </div>

    <!-- Navegação mobile: painel no fluxo, abaixo do header; nada fixo/sobreposto. -->
    <div
      v-if="user"
      v-show="isMenuOpen"
      id="mobile-nav"
      class="mx-auto mt-2 w-full max-w-7xl lg:hidden"
    >
      <nav class="ehs-card p-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-default hover:bg-elevated/60'"
        >
          <UIcon
            :name="item.icon"
            class="size-4 shrink-0"
          />
          <span class="truncate">{{ item.label }}</span>
        </NuxtLink>

        <USeparator class="my-1" />

        <div class="flex flex-wrap items-center justify-between gap-2 px-1 py-1">
          <div class="flex items-center gap-1 sm:hidden">
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
            color="error"
            variant="soft"
            size="sm"
            icon="i-lucide-log-out"
            :label="$t('logout')"
            class="ml-auto"
            @click="handleLogout"
          />
        </div>
      </nav>
    </div>
  </header>
</template>
