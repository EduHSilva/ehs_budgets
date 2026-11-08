<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'
import type { DragChangeEvent } from 'vue-draggable-next'
import BudgetModal from '~/components/modais/BudgetModal.vue'

const { $dashboardService, $budgetService } = useNuxtApp()
const toast = useToast()

const { data, refresh, pending } = await useAsyncData('kanban', () =>
  $dashboardService.findKanban()
)

const news = ref<Budget[]>([])
const working = ref<Budget[]>([])
const done = ref<Budget[]>([])
const search = ref('')
const minimumValue = ref(0)
const onlyWithValue = ref(false)

const budgetModalRef = ref<InstanceType<typeof BudgetModal> | null>(null)

function openBudgetModal() {
  budgetModalRef.value?.openModal()
}

watchEffect(() => {
  if (data.value?.data) {
    news.value = data.value.data.news ?? []
    working.value = data.value.data.working ?? []
    done.value = data.value.data.done ?? []
  }
})
async function handleKanbanChange(
  evt: DragChangeEvent<Budget>,
  status: Budget['status']
) {
  const update = async (budget: Budget) => {
    await $budgetService.update(budget.id ?? '', budget)
  }

  try {
    if (evt.added) {
      const budget = evt.added.element
      budget.status = status
      budget.kanbanOrder = evt.added.newIndex
      await update(budget)
    }

    if (evt.moved) {
      const budget = evt.moved.element
      budget.kanbanOrder = evt.moved.newIndex
      await update(budget)
    }
  } catch (e) {
    toast.add({
      title: $t('attention'),
      description: $t('errors.saveError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    console.error(e)
  }

  await refresh()
}

const handleChangeNew = (evt: DragChangeEvent<Budget>) =>
  handleKanbanChange(evt, 'APPROVED')

const handleChangeWorking = (evt: DragChangeEvent<Budget>) =>
  handleKanbanChange(evt, 'WORKING')

const handleChangeDone = (evt: DragChangeEvent<Budget>) =>
  handleKanbanChange(evt, 'DONE')

const applyFilters = (list: Budget[]) => {
  return list.filter((item) => {
    const query = search.value.toLowerCase().trim()
    const inTitle = item.title.toLowerCase().includes(query)
    const inClient = (item.clientName || item.client || '').toLowerCase().includes(query)
    const queryMatches = !query || inTitle || inClient

    const budgetTotal = item.total ?? 0
    const valueMatches = budgetTotal >= minimumValue.value
    const hasValueMatches = !onlyWithValue.value || budgetTotal > 0

    return queryMatches && valueMatches && hasValueMatches
  })
}

const filteredNews = computed(() => applyFilters(news.value))
const filteredWorking = computed(() => applyFilters(working.value))
const filteredDone = computed(() => applyFilters(done.value))

const totalCards = computed(() =>
  news.value.length + working.value.length + done.value.length
)

const visibleCards = computed(() =>
  filteredNews.value.length + filteredWorking.value.length + filteredDone.value.length
)

const pipelineValue = computed(() => {
  return [...news.value, ...working.value, ...done.value]
    .reduce((acc, item) => acc + (item.total ?? 0), 0)
})

const refreshEvent = () => {
  refresh()
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="kanban" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold font-title md:text-3xl">
            {{ $t('kanban.title') }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            {{ $t('kanban.manage') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="pending"
            :label="$t('kanban.refresh')"
            @click="refreshEvent"
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
          :title="$t('kanban.totalCards')"
          :description="`${totalCards} ${$t('kanban.items')}`"
          icon="i-lucide-layers-3"
        />
        <UPageCard
          :title="$t('kanban.visibleCards')"
          :description="`${visibleCards} ${$t('kanban.items')}`"
          icon="i-lucide-filter"
        />
        <UPageCard
          :title="$t('kanban.pipelineValue')"
          :description="formatCurrency(pipelineValue)"
          icon="i-lucide-wallet-cards"
        />
      </UPageGrid>

      <UCard class="mb-6">
        <div class="grid gap-3 md:grid-cols-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="$t('kanban.searchPlaceholder')"
          />

          <UInput
            v-model.number="minimumValue"
            type="number"
            min="0"
            icon="i-lucide-scale"
            :placeholder="$t('kanban.minimumValuePlaceholder')"
          />

          <div class="flex items-center justify-between rounded-lg border border-default px-3 py-2">
            <div>
              <p class="text-sm font-medium">
                {{ $t('kanban.onlyWithValue') }}
              </p>
              <p class="text-xs text-muted">
                {{ $t('kanban.onlyWithValueHint') }}
              </p>
            </div>
            <USwitch v-model="onlyWithValue" />
          </div>
        </div>
      </UCard>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <KanbanBoard
          :title="$t('kanban.news')"
          :description="$t('kanban.newsDescription')"
          color="orange"
          :list="filteredNews"
          :handle-change="handleChangeNew"
        />

        <KanbanBoard
          :title="$t('kanban.working')"
          :description="$t('kanban.workingDescription')"
          color="blue"
          :list="filteredWorking"
          :handle-change="handleChangeWorking"
        />

        <KanbanBoard
          :title="$t('kanban.done')"
          :description="$t('kanban.doneDescription')"
          color="green"
          :list="filteredDone"
          :handle-change="handleChangeDone"
        />
      </div>

      <BudgetModal
        ref="budgetModalRef"
        :budget="null"
        @saved="refresh"
      />
    </div>
  </div>
</template>
