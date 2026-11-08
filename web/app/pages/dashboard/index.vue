<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'
import ClientModal from '~/components/modais/ClientModal.vue'
import BudgetModal from '~/components/modais/BudgetModal.vue'

const clientModalRef = ref<InstanceType<typeof ClientModal> | null>(null)
const budgetModalRef = ref<InstanceType<typeof BudgetModal> | null>(null)

function openClientModal() {
  clientModalRef.value?.openModal()
}

function openBudgetModal() {
  budgetModalRef.value?.openModal()
}

const { $dashboardService } = useNuxtApp()
const { data, refresh, pending } = await useAsyncData('dashboard-main', () =>
  $dashboardService.find()
)

const dashData = computed(() => data.value?.data)
const recentBudgets = computed(() => dashData.value?.recentServices ?? [])
const router = useRouter()

const quickLinks = [
  { label: 'clients', to: '/clients', icon: 'i-lucide-users' },
  { label: 'budgets', to: '/budgets', icon: 'i-lucide-notebook' },
  { label: 'kanban.title', to: '/kanban', icon: 'i-lucide-kanban' },
  { label: 'reminders', to: '/reminders', icon: 'i-lucide-bell-dot' }
]

function goToBudget(id?: string) {
  if (!id) return
  router.push(`/budgets/${id}/preview`)
}

const refreshEvent = () => {
  refresh()
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="dashboard" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-title text-2xl font-bold md:text-3xl">
            {{ $t('dashboard') }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            {{ $t('dash.generalVision') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            size="sm"
            :label="$t('common.refresh')"
            :loading="pending"
            @click="refreshEvent"
          />
          <UButton
            icon="i-lucide-user-plus"
            size="sm"
            :label="$t('newClient')"
            @click="openClientModal"
          />
          <UButton
            icon="i-lucide-plus"
            size="sm"
            :label="$t('newBudget')"
            @click="openBudgetModal"
          />
        </div>
      </div>

      <UPageGrid class="mb-5">
        <UPageCard
          :title="$t('dash.totalOfClients')"
          :description="(dashData?.totalClients ?? 0).toString()"
          icon="i-lucide-users"
        />
        <UPageCard
          :title="$t('dash.pendingServices')"
          :description="(dashData?.pendingServices ?? 0).toString()"
          icon="i-lucide-hourglass"
        />
        <UPageCard
          :title="$t('dash.working')"
          :description="(dashData?.workingServices ?? 0).toString()"
          icon="i-lucide-briefcase-business"
        />
        <UPageCard
          :title="$t('dash.income')"
          :description="formatCurrency(dashData?.totalReceived ?? 0)"
          icon="i-lucide-wallet-cards"
        />
      </UPageGrid>

      <UCard class="mb-6">
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-for="link in quickLinks"
            :key="link.to"
            size="xs"
            color="neutral"
            variant="soft"
            :icon="link.icon"
            :label="$t(link.label)"
            :to="link.to"
          />
        </div>
      </UCard>

      <div class="grid gap-6 xl:grid-cols-2">
        <UCard>
          <template #header>
            <h3 class="text-base font-bold md:text-lg">
              {{ $t('recentBudgets') }}
            </h3>
          </template>

          <div
            v-if="!recentBudgets.length"
            class="rounded-lg border border-dashed border-default p-4 text-sm text-muted"
          >
            {{ $t('dash.noRecentBudgets') }}
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="item in recentBudgets"
              :key="item.id"
              class="rounded-lg border border-default p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold">
                    {{ item.title }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ item.clientName }}
                  </p>
                </div>

                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  {{ formatCurrency(item.total ?? 0) }}
                </UBadge>
              </div>

              <p class="mt-2 text-sm text-muted line-clamp-2">
                {{ item.description }}
              </p>

              <div class="mt-3 flex items-center justify-end">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-eye"
                  :label="$t('view')"
                  @click="goToBudget(item.id)"
                />
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-base font-bold md:text-lg">
              {{ $t('shortcuts') }}
            </h3>
          </template>

          <div class="space-y-3">
            <UPageFeature
              :title="$t('newClient')"
              :description="$t('dash.shortcutNewClient')"
              icon="i-lucide-users"
              @click="openClientModal"
            />
            <USeparator />
            <UPageFeature
              :title="$t('newBudget')"
              :description="$t('dash.shortcutNewBudget')"
              icon="i-lucide-notebook"
              @click="openBudgetModal"
            />
            <USeparator />
            <UPageFeature
              :title="$t('newReminder')"
              :description="$t('dash.shortcutReminder')"
              icon="i-lucide-bell"
              to="/reminders"
            />
            <USeparator />
            <UPageFeature
              :title="$t('viewKanban')"
              :description="$t('dash.shortcutKanban')"
              icon="i-lucide-kanban"
              to="/kanban"
            />
          </div>
        </UCard>
      </div>
    </div>

    <ClientModal
      ref="clientModalRef"
      :client="null"
    />
    <BudgetModal
      ref="budgetModalRef"
      :budget="null"
      @saved="refresh"
    />
  </div>
</template>
