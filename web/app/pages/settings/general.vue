<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'

const { t } = useI18n()

const preferences = ref({
  defaultPage: '/dashboard',
  dateFormat: 'DD/MM/YYYY',
  currency: 'BRL',
  weekStart: 'MONDAY',
  compactMode: false,
  autoSaveInterval: 10
})

const notifications = ref({
  taskAlerts: true,
  budgetAlerts: true,
  overdueAlerts: true,
  desktop: false,
  digest: 'daily'
})

const automations = ref({
  autoMoveKanban: true,
  remindPendingBudget: true,
  remindInactiveClient: false,
  reminderDaysBefore: 2
})

const pageOptions = computed(() => ([
  { label: t('dashboard'), value: '/dashboard' },
  { label: t('clients'), value: '/clients' },
  { label: t('budgets'), value: '/budgets' },
  { label: t('kanban.title'), value: '/kanban' }
]))

const dateOptions = computed(() => ([
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
]))

const currencyOptions = computed(() => ([
  { label: t('generalSettings.currencyBrl'), value: 'BRL' },
  { label: t('generalSettings.currencyUsd'), value: 'USD' },
  { label: t('generalSettings.currencyEur'), value: 'EUR' }
]))

const weekStartOptions = computed(() => ([
  { label: t('generalSettings.weekStartMonday'), value: 'MONDAY' },
  { label: t('generalSettings.weekStartSunday'), value: 'SUNDAY' }
]))

const digestOptions = computed(() => ([
  { label: t('generalSettings.digestDaily'), value: 'daily' },
  { label: t('generalSettings.digestWeekly'), value: 'weekly' },
  { label: t('generalSettings.digestCritical'), value: 'critical' }
]))
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="settings general" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6">
        <h1 class="font-bold font-title text-2xl md:text-3xl">
          {{ $t('generalSettings.title') }}
        </h1>
        <p class="mt-1 max-w-2xl text-sm text-muted">
          {{ $t('generalSettings.description') }}
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('generalSettings.workspaceTitle') }}
            </h2>
          </template>

          <div class="space-y-4">
            <USelectMenu
              v-model="preferences.defaultPage"
              value-key="value"
              :items="pageOptions"
              :label="$t('generalSettings.defaultPage')"
            />
            <USelectMenu
              v-model="preferences.dateFormat"
              value-key="value"
              :items="dateOptions"
              :label="$t('generalSettings.dateFormat')"
            />
            <USelectMenu
              v-model="preferences.currency"
              value-key="value"
              :items="currencyOptions"
              :label="$t('generalSettings.defaultCurrency')"
            />
            <USelectMenu
              v-model="preferences.weekStart"
              value-key="value"
              :items="weekStartOptions"
              :label="$t('generalSettings.weekStart')"
            />

            <div>
              <p class="text-sm mb-2 font-medium">
                {{ $t('generalSettings.autoSaveInterval') }}
              </p>
              <USlider
                v-model="preferences.autoSaveInterval"
                :min="1"
                :max="30"
              />
              <p class="text-sm text-muted mt-2">
                {{ $t('generalSettings.autoSaveHint', { minutes: preferences.autoSaveInterval }) }}
              </p>
            </div>

            <div class="flex items-start justify-between gap-3 border border-default rounded-lg p-3">
              <div>
                <p class="font-medium">
                  {{ $t('generalSettings.compactMode') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('generalSettings.compactModeHint') }}
                </p>
              </div>
              <USwitch v-model="preferences.compactMode" />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('generalSettings.notificationsTitle') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <p class="font-medium">
                {{ $t('generalSettings.taskAlerts') }}
              </p>
              <USwitch v-model="notifications.taskAlerts" />
            </div>
            <div class="flex items-start justify-between gap-3">
              <p class="font-medium">
                {{ $t('generalSettings.pendingBudgetAlerts') }}
              </p>
              <USwitch v-model="notifications.budgetAlerts" />
            </div>
            <div class="flex items-start justify-between gap-3">
              <p class="font-medium">
                {{ $t('generalSettings.overdueAlerts') }}
              </p>
              <USwitch v-model="notifications.overdueAlerts" />
            </div>
            <div class="flex items-start justify-between gap-3">
              <p class="font-medium">
                {{ $t('generalSettings.desktopNotifications') }}
              </p>
              <USwitch v-model="notifications.desktop" />
            </div>
            <USelectMenu
              v-model="notifications.digest"
              value-key="value"
              :items="digestOptions"
              :label="$t('generalSettings.emailDigest')"
            />
          </div>
        </UCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-2 mt-6">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('generalSettings.automationsTitle') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('generalSettings.autoMoveKanban') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('generalSettings.autoMoveKanbanHint') }}
                </p>
              </div>
              <USwitch v-model="automations.autoMoveKanban" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('generalSettings.remindPendingBudget') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('generalSettings.remindPendingBudgetHint') }}
                </p>
              </div>
              <USwitch v-model="automations.remindPendingBudget" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('generalSettings.remindInactiveClient') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('generalSettings.remindInactiveClientHint') }}
                </p>
              </div>
              <USwitch v-model="automations.remindInactiveClient" />
            </div>

            <UInput
              v-model.number="automations.reminderDaysBefore"
              type="number"
              min="1"
              max="10"
              :label="$t('generalSettings.reminderDaysBefore')"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('generalSettings.backupTitle') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="rounded-lg border border-default p-3">
              <p class="text-sm text-muted">
                {{ $t('generalSettings.lastBackup') }}
              </p>
              <p class="font-medium mt-1">
                25/04/2026 às 03:10
              </p>
            </div>

            <div class="rounded-lg border border-default p-3">
              <p class="text-sm text-muted mb-2">
                {{ $t('generalSettings.storageUsage') }}
              </p>
              <UProgress :model-value="64" />
              <p class="text-sm mt-2">
                {{ $t('generalSettings.storageUsageHint') }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                icon="i-lucide-download"
                :label="$t('generalSettings.exportData')"
                variant="outline"
              />
              <UButton
                icon="i-lucide-database-backup"
                :label="$t('generalSettings.createBackup')"
              />
            </div>
          </div>
        </UCard>
      </div>

      <div class="mt-6 flex justify-end">
        <UButton
          icon="i-lucide-save"
          :label="$t('generalSettings.saveSettings')"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
