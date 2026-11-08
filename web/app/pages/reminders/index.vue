<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'

const { t } = useI18n()

type ReminderStatus = 'PENDING' | 'TODAY' | 'DONE'
type ReminderPriority = 'LOW' | 'MEDIUM' | 'HIGH'

type Reminder = {
  id: number
  title: string
  client: string
  date: string
  time: string
  status: ReminderStatus
  priority: ReminderPriority
  channel: string
}

const search = ref('')
const statusFilter = ref<'ALL' | ReminderStatus>('ALL')
const quickForm = ref({
  title: '',
  client: '',
  date: '',
  time: '',
  priority: 'MEDIUM' as ReminderPriority
})

const reminders = ref<Reminder[]>([
  {
    id: 1,
    title: 'Enviar proposta comercial',
    client: 'Ateliê Aurora',
    date: '2026-04-25',
    time: '10:30',
    status: 'TODAY',
    priority: 'HIGH',
    channel: 'Email'
  },
  {
    id: 2,
    title: 'Revisar contrato mensal',
    client: 'Studio Nexo',
    date: '2026-04-26',
    time: '14:00',
    status: 'PENDING',
    priority: 'MEDIUM',
    channel: 'WhatsApp'
  },
  {
    id: 3,
    title: 'Follow-up de pagamento',
    client: 'Clínica Persona',
    date: '2026-04-24',
    time: '17:45',
    status: 'DONE',
    priority: 'LOW',
    channel: 'Ligação'
  },
  {
    id: 4,
    title: 'Reunião de alinhamento',
    client: 'Arco Digital',
    date: '2026-04-27',
    time: '09:00',
    status: 'PENDING',
    priority: 'HIGH',
    channel: 'Google Meet'
  }
])

const statusItems = computed(() => ([
  { label: t('reminder.allStatus'), value: 'ALL' },
  { label: t('reminder.todayStatus'), value: 'TODAY' },
  { label: t('reminder.pendingStatus'), value: 'PENDING' },
  { label: t('reminder.doneStatus'), value: 'DONE' }
]))

const priorityItems = computed(() => ([
  { label: t('reminder.priority.low'), value: 'LOW' },
  { label: t('reminder.priority.medium'), value: 'MEDIUM' },
  { label: t('reminder.priority.high'), value: 'HIGH' }
]))

const summary = computed(() => {
  return {
    today: reminders.value.filter(item => item.status === 'TODAY').length,
    pending: reminders.value.filter(item => item.status === 'PENDING').length,
    done: reminders.value.filter(item => item.status === 'DONE').length
  }
})

const filteredReminders = computed(() => {
  return reminders.value.filter((item) => {
    const statusMatches = statusFilter.value === 'ALL' || item.status === statusFilter.value
    const searchMatches = item.title.toLowerCase().includes(search.value.toLowerCase())
      || item.client.toLowerCase().includes(search.value.toLowerCase())
    return statusMatches && searchMatches
  })
})

function addReminder() {
  if (!quickForm.value.title || !quickForm.value.client || !quickForm.value.date || !quickForm.value.time) {
    return
  }

  reminders.value.unshift({
    id: Date.now(),
    title: quickForm.value.title,
    client: quickForm.value.client,
    date: quickForm.value.date,
    time: quickForm.value.time,
    status: 'PENDING',
    priority: quickForm.value.priority,
    channel: 'Manual'
  })

  quickForm.value = {
    title: '',
    client: '',
    date: '',
    time: '',
    priority: 'MEDIUM'
  }
}

function markAsDone(id: number) {
  reminders.value = reminders.value.map((item) => {
    if (item.id === id) {
      return { ...item, status: 'DONE' as const }
    }

    return item
  })
}

function statusColor(status: ReminderStatus) {
  if (status === 'TODAY') return 'warning'
  if (status === 'DONE') return 'success'
  return 'neutral'
}

function statusLabel(status: ReminderStatus) {
  if (status === 'TODAY') return t('reminder.todayStatus')
  if (status === 'DONE') return t('reminder.doneStatus')
  return t('reminder.pendingStatus')
}

function priorityColor(priority: ReminderPriority) {
  if (priority === 'HIGH') return 'error'
  if (priority === 'MEDIUM') return 'warning'
  return 'neutral'
}

function priorityLabel(priority: ReminderPriority) {
  if (priority === 'HIGH') return t('reminder.priority.high')
  if (priority === 'MEDIUM') return t('reminder.priority.medium')
  return t('reminder.priority.low')
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="reminders" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-bold font-title text-2xl md:text-3xl">
            {{ $t('reminders') }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            {{ $t('reminder.manage') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
          size="lg"
        >
          {{ filteredReminders.length }} {{ $t('reminder.items') }}
        </UBadge>
      </div>

      <UPageGrid class="mb-6">
        <UPageCard
          :title="$t('reminder.todayCard')"
          :description="`${summary.today} ${$t('reminder.items')}`"
          icon="i-lucide-calendar-days"
        />
        <UPageCard
          :title="$t('reminder.pendingCard')"
          :description="`${summary.pending} ${$t('reminder.items')}`"
          icon="i-lucide-bell-dot"
        />
        <UPageCard
          :title="$t('reminder.doneCard')"
          :description="`${summary.done} ${$t('reminder.items')}`"
          icon="i-lucide-check-check"
        />
      </UPageGrid>

      <div class="grid gap-6 lg:grid-cols-3">
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="grid gap-3 md:grid-cols-2">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                :placeholder="$t('reminder.searchPlaceholder')"
              />
              <USelectMenu
                v-model="statusFilter"
                value-key="value"
                :items="statusItems"
                :placeholder="$t('reminder.filterPlaceholder')"
              />
            </div>
          </template>

          <div class="space-y-3">
            <UAlert
              v-if="!filteredReminders.length"
              icon="i-lucide-info"
              :title="$t('reminder.emptyTitle')"
              :description="$t('reminder.emptyDescription')"
              color="neutral"
              variant="subtle"
            />

            <div
              v-for="item in filteredReminders"
              :key="item.id"
              class="rounded-lg border border-default p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <h3 class="font-semibold text-base">
                    {{ item.title }}
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                    >
                      {{ item.client }}
                    </UBadge>
                    <UBadge
                      color="neutral"
                      variant="subtle"
                    >
                      {{ item.date }} · {{ item.time }}
                    </UBadge>
                    <UBadge
                      :color="priorityColor(item.priority)"
                      variant="subtle"
                    >
                      {{ $t('reminder.priorityLabel') }} {{ priorityLabel(item.priority) }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(item.status)"
                      variant="subtle"
                    >
                      {{ statusLabel(item.status) }}
                    </UBadge>
                  </div>
                  <p class="text-sm text-muted">
                    {{ $t('reminder.channelLabel') }} {{ item.channel }}
                  </p>
                </div>

                <UButton
                  v-if="item.status !== 'DONE'"
                  icon="i-lucide-check"
                  :label="$t('reminder.complete')"
                  size="sm"
                  color="primary"
                  variant="soft"
                  @click="markAsDone(item.id)"
                />
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <h2 class="font-semibold text-lg">
                {{ $t('newReminder') }}
              </h2>
              <p class="text-sm text-muted">
                {{ $t('reminder.mockHint') }}
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <UInput
              v-model="quickForm.title"
              :label="$t('budget.title')"
              :placeholder="$t('reminder.titlePlaceholder')"
            />
            <UInput
              v-model="quickForm.client"
              :label="$t('budget.client')"
              :placeholder="$t('reminder.clientPlaceholder')"
            />
            <UInput
              v-model="quickForm.date"
              :label="$t('reminder.dateLabel')"
              type="date"
            />
            <UInput
              v-model="quickForm.time"
              :label="$t('reminder.timeLabel')"
              type="time"
            />
            <USelectMenu
              v-model="quickForm.priority"
              value-key="value"
              :items="priorityItems"
              :label="$t('reminder.priorityLabel')"
              :placeholder="$t('reminder.selectPlaceholder')"
            />
            <UButton
              block
              :label="$t('newReminder')"
              icon="i-lucide-plus"
              class="mt-2"
              @click="addReminder"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
