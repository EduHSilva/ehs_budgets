<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps({
  active: {
    type: String,
    required: true
  }
})

const items: NavigationMenuItem[][] = [[{
  label: $t('dashboard'),
  icon: 'i-lucide-house',
  to: '/dashboard',
  active: props.active?.includes('dashboard')
}, {
  label: $t('clients'),
  icon: 'i-lucide-users',
  to: '/clients',
  active: props.active?.includes('clients')
},
{
  label: $t('budgets'),
  to: '/budgets',
  icon: 'i-lucide-notebook',
  active: props.active?.includes('budgets')
},
{
  label: $t('kanban.title'),
  to: '/kanban',
  icon: 'i-lucide-kanban',
  active: props.active?.includes('kanban')
},
{
  label: $t('reminders'),
  to: '/reminders',
  icon: 'i-lucide-bell-dot',
  active: props.active?.includes('reminders')
},
{
  label: $t('account'),
  to: '/settings/account',
  icon: 'i-lucide-circle-user',
  active: props.active?.includes('account')
}]]

// Sidebar escura nos dois temas (tokens ehs-sidebar-*); o item ativo ganha
// barra de accent + gradiente suave em vez do preenchimento neutro do NU.
const navUi = {
  label: 'text-sidebar-muted',
  item: 'mb-0.5',
  link: 'h-10 px-3 text-[13.5px] text-sidebar-muted hover:text-sidebar-text hover:before:bg-white/6 data-[active=true]:ehs-nav-active data-[active=true]:text-sidebar-text',
  linkLeadingIcon: 'size-[18px] text-sidebar-muted group-hover:text-sidebar-text group-data-[state=open]:text-sidebar-text',
  linkTrailingBadge: '!ring-0 !bg-white/10 !text-sidebar-muted',
  linkTrailingIcon: 'text-sidebar-muted',
  childList: 'border-white/10',
  childLink: 'h-9 text-[13px] text-sidebar-muted hover:text-sidebar-text data-[active=true]:text-sidebar-text data-[active=true]:before:bg-white/6 hover:before:bg-white/6'
}
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{
      root: 'ehs-sidebar hidden lg:flex !border-e-0',
      header: 'border-b border-white/5',
      body: 'gap-2 px-3 py-5',
      footer: 'border-t border-white/5 px-3'
    }"
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/dashboard"
        class="flex min-w-0 items-center gap-2.5"
      >
        <span class="ehs-brand-icon flex size-8 shrink-0 items-center justify-center rounded-[10px]">
          <UIcon
            name="i-lucide-shield-check"
            class="size-4"
          />
        </span>
        <span
          v-if="!collapsed"
          class="min-w-0 leading-tight"
        >
          <span class="block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">EHS Solutions</span>
          <span class="block truncate font-heading text-[17px] font-semibold tracking-[-0.01em] text-sidebar-text">Orçamentos</span>
        </span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
        variant="pill"
        :ui="navUi"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        variant="pill"
        class="mt-auto"
        :ui="navUi"
      />
    </template>
  </UDashboardSidebar>
</template>
