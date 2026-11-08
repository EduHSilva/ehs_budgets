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
  badge: '4',
  icon: 'i-lucide-bell-dot',
  active: props.active?.includes('reminders')
},
{
  label: $t('settings'),
  icon: 'i-lucide-settings',
  defaultOpen: false,
  children: [{
    label: $t('general'),
    to: '/settings/general',
    active: props.active?.includes('settings')
  }, {
    label: $t('account'),
    to: '/settings/account',
    active: props.active?.includes('account')
  }]
}]]
</script>

<template>
  <UDashboardSidebar
    class="hidden lg:flex"
    collapsible
    resizable
  >
    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="mt-auto"
      />
    </template>
  </UDashboardSidebar>
</template>
