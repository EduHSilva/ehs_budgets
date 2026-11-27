<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'
import type { Client, Task, TaskPriority } from '~/utils/types'

type ReminderStatus = 'TODAY' | 'PENDING' | 'DONE'
type StatusFilterValue = 'ALL' | ReminderStatus

type TaskForm = {
  title: string
  clientId: string
  date: string
  time: string
  priority: TaskPriority
  details: string
}

const { t, locale } = useI18n()
const toast = useToast()
const { $clientService, $taskService } = useNuxtApp()

const clients = ref<Client[]>([])
const tasks = ref<Task[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const busyId = ref<string | null>(null)

const search = ref('')
const statusFilter = ref<StatusFilterValue>('ALL')

const editingId = ref<string | null>(null)
const isEditing = computed(() => editingId.value !== null)

const deleteOpen = ref(false)
const deleteTarget = ref<Task | null>(null)

function emptyForm(): TaskForm {
  return {
    title: '',
    clientId: '',
    date: '',
    time: '09:00',
    priority: 'MEDIUM',
    details: ''
  }
}

const form = ref<TaskForm>(emptyForm())

const displayLocale = computed(() => locale.value === 'en' ? 'en-US' : 'pt-BR')

const dateFormatter = computed(() => new Intl.DateTimeFormat(displayLocale.value, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}))

const timeFormatter = computed(() => new Intl.DateTimeFormat(displayLocale.value, {
  hour: '2-digit',
  minute: '2-digit'
}))

const statusItems = computed<{ label: string, value: StatusFilterValue }[]>(() => ([
  { label: t('reminder.allStatus'), value: 'ALL' },
  { label: t('reminder.todayStatus'), value: 'TODAY' },
  { label: t('reminder.pendingStatus'), value: 'PENDING' },
  { label: t('reminder.doneStatus'), value: 'DONE' }
]))

const priorityItems = computed<{ label: string, value: TaskPriority }[]>(() => ([
  { label: t('reminder.priority.low'), value: 'LOW' },
  { label: t('reminder.priority.medium'), value: 'MEDIUM' },
  { label: t('reminder.priority.high'), value: 'HIGH' }
]))

const clientItems = computed<{ label: string, value: string }[]>(() => ([
  { label: t('reminder.noClient'), value: '' },
  ...clients.value
    .filter(client => Boolean(client.id))
    .map(client => ({ label: client.name, value: client.id as string }))
]))

const clientNames = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}

  for (const client of clients.value) {
    if (client.id) {
      map[client.id] = client.name
    }
  }

  return map
})

const summary = computed(() => ({
  today: tasks.value.filter(task => derivedStatus(task) === 'TODAY').length,
  pending: tasks.value.filter(task => derivedStatus(task) === 'PENDING').length,
  done: tasks.value.filter(task => derivedStatus(task) === 'DONE').length
}))

const filteredTasks = computed(() => {
  const term = search.value.trim().toLowerCase()

  return tasks.value.filter((task) => {
    const statusMatches = statusFilter.value === 'ALL' || derivedStatus(task) === statusFilter.value
    if (!statusMatches) {
      return false
    }
    if (!term) {
      return true
    }

    return task.title.toLowerCase().includes(term)
      || (task.details || '').toLowerCase().includes(term)
      || clientName(task.clientId).toLowerCase().includes(term)
  })
})

const canSave = computed(() => form.value.title.trim().length > 0 && form.value.date.length > 0)

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function localTimeKey(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function rangeBoundary(years: number) {
  const date = new Date()
  date.setFullYear(date.getFullYear() + years)
  return localDateKey(date)
}

function clientName(clientId?: string | null) {
  if (!clientId) {
    return ''
  }
  return clientNames.value[clientId] || ''
}

function isToday(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const now = new Date()
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

function derivedStatus(task: Task): ReminderStatus {
  if (task.status === 'DONE') {
    return 'DONE'
  }
  if (isToday(task.startDate)) {
    return 'TODAY'
  }
  return 'PENDING'
}

function statusColor(status: ReminderStatus) {
  if (status === 'DONE') {
    return 'success'
  }
  if (status === 'TODAY') {
    return 'warning'
  }
  return 'neutral'
}

function statusLabel(status: ReminderStatus) {
  if (status === 'DONE') {
    return t('reminder.doneStatus')
  }
  if (status === 'TODAY') {
    return t('reminder.todayStatus')
  }
  return t('reminder.pendingStatus')
}

function priorityColor(priority: TaskPriority) {
  if (priority === 'HIGH') {
    return 'error'
  }
  if (priority === 'MEDIUM') {
    return 'warning'
  }
  return 'neutral'
}

function priorityLabel(priority: TaskPriority) {
  if (priority === 'HIGH') {
    return t('reminder.priority.high')
  }
  if (priority === 'MEDIUM') {
    return t('reminder.priority.medium')
  }
  return t('reminder.priority.low')
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return dateFormatter.value.format(date)
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return timeFormatter.value.format(date)
}

function buildStartDate(date: string, time: string) {
  const parts = date.split('-').map(Number)
  if (parts.length !== 3 || parts.some(part => Number.isNaN(part))) {
    return null
  }

  const [year, month, day] = parts as [number, number, number]
  const timeParts = (time || '09:00').split(':').map(Number)
  const hours = Number.isNaN(timeParts[0] ?? Number.NaN) ? 9 : (timeParts[0] as number)
  const minutes = Number.isNaN(timeParts[1] ?? Number.NaN) ? 0 : (timeParts[1] as number)
  const value = new Date(year, month - 1, day, hours, minutes)

  if (Number.isNaN(value.getTime())) {
    return null
  }

  return value.toISOString()
}

function sortTasks(list: Task[]) {
  return [...list].sort((a, b) => {
    const aDone = a.status === 'DONE'
    const bDone = b.status === 'DONE'

    if (aDone !== bDone) {
      return aDone ? 1 : -1
    }

    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })
}

function notify(description: string, color: 'success' | 'error') {
  toast.add({
    title: color === 'success' ? t('success') : t('attention'),
    description,
    icon: color === 'success' ? 'i-lucide-check' : 'i-lucide-alert-triangle',
    color
  })
}

async function loadClients() {
  const size = 100

  try {
    const response = await $clientService.find(0, null, null, size)
    let items: Client[] = response.data.items || []
    const total = response.data.total || items.length
    let page = 1

    while (items.length < total && page < 10) {
      const next = await $clientService.find(page, null, null, size)
      const nextItems: Client[] = next.data.items || []

      if (!nextItems.length) {
        break
      }

      items = [...items, ...nextItems]
      page += 1
    }

    clients.value = items
  } catch (error) {
    console.error(error)
  }
}

async function loadTasks() {
  loading.value = true
  const size = 100

  try {
    const start = rangeBoundary(-3)
    const end = rangeBoundary(2)
    const first = await $taskService.findRange(start, end, size)
    let items: Task[] = first.data.items || []
    const total = first.data.total || items.length
    let page = 1

    // Lembretes antigos continuam listados; busca além da primeira página até o total.
    while (items.length < total && page < 10) {
      const next = await $taskService.findRange(start, end, size, page)
      const nextItems: Task[] = next.data.items || []

      if (!nextItems.length) {
        break
      }

      items = [...items, ...nextItems]
      page += 1
    }

    tasks.value = sortTasks(items)
  } catch (error) {
    notify(t('reminder.loadError'), 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function reload() {
  await Promise.all([loadTasks(), loadClients()])
}

function resetForm() {
  form.value = emptyForm()
  editingId.value = null
}

function startEdit(task: Task) {
  const date = new Date(task.startDate)
  const valid = !Number.isNaN(date.getTime())

  editingId.value = task.id
  form.value = {
    title: task.title,
    clientId: task.clientId || '',
    date: valid ? localDateKey(date) : '',
    time: valid ? localTimeKey(date) : '09:00',
    priority: task.priority || 'MEDIUM',
    details: task.details || ''
  }
}

async function saveTask() {
  if (!canSave.value || saving.value) {
    return
  }

  const startDate = buildStartDate(form.value.date, form.value.time)
  if (startDate === null) {
    return
  }

  const clientId = form.value.clientId || null
  saving.value = true

  try {
    if (editingId.value !== null) {
      await $taskService.update(editingId.value, {
        title: form.value.title.trim(),
        details: form.value.details.trim(),
        startDate,
        priority: form.value.priority,
        clientId,
        clearClient: clientId === null
      })
      notify(t('reminder.updated'), 'success')
    } else {
      await $taskService.add({
        title: form.value.title.trim(),
        details: form.value.details.trim(),
        startDate,
        priority: form.value.priority,
        clientId
      })
      notify(t('reminder.created'), 'success')
    }

    resetForm()
    await loadTasks()
  } catch (error) {
    notify(t('reminder.saveError'), 'error')
    console.error(error)
  } finally {
    saving.value = false
  }
}

async function completeTask(task: Task) {
  if (busyId.value !== null) {
    return
  }

  busyId.value = task.id

  try {
    await $taskService.complete(task.id)
    notify(t('reminder.completed'), 'success')
    await loadTasks()
  } catch (error) {
    notify(t('reminder.saveError'), 'error')
    console.error(error)
  } finally {
    busyId.value = null
  }
}

function askDelete(task: Task) {
  deleteTarget.value = task
  deleteOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target || deleting.value) {
    return
  }

  deleting.value = true

  try {
    await $taskService.delete(target.id)

    if (editingId.value === target.id) {
      resetForm()
    }

    deleteOpen.value = false
    deleteTarget.value = null
    notify(t('reminder.deleted'), 'success')
    await loadTasks()
  } catch (error) {
    notify(t('reminder.saveError'), 'error')
    console.error(error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await reload()
})
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="reminders" />

    <div class="flex-1 min-w-0 p-4 md:p-8 md:pr-10">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="ehs-page-title">
            {{ $t('reminders') }}
          </h1>
          <p class="mt-1.5 max-w-2xl text-sm text-muted">
            {{ $t('reminder.manage') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
          size="lg"
        >
          {{ filteredTasks.length }} {{ $t('reminder.items') }}
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
            <div class="flex flex-col gap-3 md:flex-row md:items-center">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                :placeholder="$t('reminder.searchPlaceholder')"
                class="flex-1"
              />
              <USelectMenu
                v-model="statusFilter"
                value-key="value"
                :items="statusItems"
                :placeholder="$t('reminder.filterPlaceholder')"
                class="md:w-48"
              />
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="outline"
                :label="$t('common.refresh')"
                :loading="loading"
                @click="reload"
              />
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-if="loading && !tasks.length"
              class="flex justify-center py-6"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-5 animate-spin text-muted"
              />
            </div>

            <UAlert
              v-else-if="!filteredTasks.length"
              icon="i-lucide-info"
              :title="$t('reminder.emptyTitle')"
              :description="$t('reminder.emptyDescription')"
              color="neutral"
              variant="subtle"
            />

            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="rounded-lg border border-default p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <h3 class="font-semibold text-base">
                    {{ task.title }}
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-if="clientName(task.clientId)"
                      color="neutral"
                      variant="subtle"
                    >
                      {{ clientName(task.clientId) }}
                    </UBadge>
                    <UBadge
                      color="neutral"
                      variant="subtle"
                    >
                      {{ formatDate(task.startDate) }} · {{ formatTime(task.startDate) }}
                    </UBadge>
                    <UBadge
                      :color="priorityColor(task.priority)"
                      variant="subtle"
                    >
                      {{ $t('reminder.priorityLabel') }} {{ priorityLabel(task.priority) }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(derivedStatus(task))"
                      variant="subtle"
                    >
                      {{ statusLabel(derivedStatus(task)) }}
                    </UBadge>
                  </div>
                  <p
                    v-if="task.details"
                    class="text-sm text-muted"
                  >
                    {{ task.details }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UButton
                    v-if="derivedStatus(task) !== 'DONE'"
                    icon="i-lucide-check"
                    :label="$t('reminder.complete')"
                    size="sm"
                    color="primary"
                    variant="soft"
                    :loading="busyId === task.id"
                    :disabled="busyId !== null && busyId !== task.id"
                    @click="completeTask(task)"
                  />
                  <UButton
                    icon="i-lucide-pencil"
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    :aria-label="$t('edit')"
                    @click="startEdit(task)"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    size="sm"
                    color="error"
                    variant="ghost"
                    :aria-label="$t('delete')"
                    @click="askDelete(task)"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <h2 class="ehs-section-title">
                {{ isEditing ? $t('reminder.editTitle') : $t('newReminder') }}
              </h2>
              <p class="text-sm text-muted">
                {{ $t('reminder.formHint') }}
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <UInput
              v-model="form.title"
              :label="$t('budget.title')"
              :placeholder="$t('reminder.titlePlaceholder')"
              maxlength="255"
            />
            <USelectMenu
              v-model="form.clientId"
              value-key="value"
              :items="clientItems"
              :label="$t('budget.client')"
              :placeholder="$t('reminder.selectPlaceholder')"
            />
            <div class="grid gap-3 sm:grid-cols-2">
              <UInput
                v-model="form.date"
                :label="$t('reminder.dateLabel')"
                type="date"
              />
              <UInput
                v-model="form.time"
                :label="$t('reminder.timeLabel')"
                type="time"
              />
            </div>
            <USelectMenu
              v-model="form.priority"
              value-key="value"
              :items="priorityItems"
              :label="$t('reminder.priorityLabel')"
              :placeholder="$t('reminder.selectPlaceholder')"
            />
            <UTextarea
              v-model="form.details"
              :label="$t('reminder.detailsLabel')"
              :placeholder="$t('reminder.detailsPlaceholder')"
              autoresize
              :rows="3"
              maxlength="2000"
              class="w-full"
            />
            <UButton
              block
              :label="isEditing ? $t('reminder.saveChanges') : $t('newReminder')"
              :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
              :loading="saving"
              :disabled="!canSave"
              class="mt-2"
              @click="saveTask"
            />
            <UButton
              v-if="isEditing"
              block
              color="neutral"
              variant="ghost"
              :label="$t('cancel')"
              @click="resetForm"
            />
          </div>
        </UCard>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      class="max-w-md"
      :title="$t('reminder.deleteTitle')"
    >
      <template #body>
        <p class="text-sm text-muted">
          {{ $t('reminder.deleteDescription') }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            :label="$t('cancel')"
            @click="deleteOpen = false"
          />
          <UButton
            color="error"
            :label="$t('reminder.confirmDelete')"
            :loading="deleting"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
