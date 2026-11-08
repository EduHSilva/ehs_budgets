<script setup lang="ts">
import { computed, h, ref } from 'vue'
import SideBar from '~/components/SideBar.vue'
import { UBadge, UButton } from '#components'
import BudgetModal from '~/components/modais/BudgetModal.vue'
import type { ColumnDef } from '@tanstack/vue-table'

type BudgetRow = Budget & { status?: string }

const search = ref('')
const filter = ref('')
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
const { $budgetService } = useNuxtApp()
const toast = useToast()

const response = await $budgetService.find(pagination.value.pageIndex, null, null, pagination.value.pageSize)
const data = ref<BudgetRow[]>(response.data.items || [])
const totalItems = ref(response.data.total || 0)
const statusFilter = [
  {
    label: $t('budget.filterAll'),
    id: ''
  },
  {
    label: $t('budget.draft'),
    id: 'DRAFT'
  },
  {
    label: $t('budget.send'),
    id: 'SEND'
  },
  {
    label: $t('budget.waiting'),
    id: 'WAITING'
  },
  {
    label: $t('budget.approved'),
    id: 'APPROVED'
  },
  {
    label: $t('budget.working'),
    id: 'WORKING'
  },
  {
    label: $t('budget.done'),
    id: 'DONE'
  },
  {
    label: $t('budget.cancel'),
    id: 'CANCEL'
  },
  {
    label: $t('budget.deny'),
    id: 'DENY'
  }
]

const modalRef = ref<InstanceType<typeof BudgetModal> | null>(null)

const edit = ref(false)
const selectedBudget = ref<Budget | null>(null)

function openModal() {
  modalRef.value?.openModal()
}

function refresh() {
  $budgetService.find(pagination.value.pageIndex, search.value, filter.value, pagination.value.pageSize).then((res) => {
    totalItems.value = res.data.total ?? 0
    data.value = res.data.items
  })
}

function applyFilters() {
  pagination.value.pageIndex = 0
  refresh()
}

function changePage(page: number) {
  pagination.value.pageIndex = page - 1
  refresh()
}

const status = {
  DRAFT: 'warning',
  WAITING: 'warning',
  SEND: 'info',
  WORKING: 'neutral',
  APPROVED: 'success',
  DONE: 'success',
  CANCEL: 'error',
  DENY: 'error'
} as const

const cardsCount = computed(() => data.value.length)
const approvedCount = computed(() =>
  data.value.filter(item => item.status === 'APPROVED').length
)
const workingCount = computed(() =>
  data.value.filter(item => item.status === 'WORKING').length
)
const pipelineValue = computed(() =>
  data.value.reduce((acc, item) => acc + (item.total ?? 0), 0)
)

const quickFilterItems = [
  { label: $t('budget.filterAll'), id: '' },
  { label: $t('budget.draft'), id: 'DRAFT' },
  { label: $t('budget.waiting'), id: 'WAITING' },
  { label: $t('budget.approved'), id: 'APPROVED' },
  { label: $t('budget.working'), id: 'WORKING' },
  { label: $t('budget.done'), id: 'DONE' }
]

function setStatusFilter(statusId: string) {
  filter.value = statusId
  applyFilters()
}

function clearFilters() {
  search.value = ''
  filter.value = ''
  applyFilters()
}

function statusLabel(value: string) {
  switch (value) {
    case 'DRAFT': return $t('budget.draft')
    case 'SEND': return $t('budget.send')
    case 'WAITING': return $t('budget.waiting')
    case 'APPROVED': return $t('budget.approved')
    case 'WORKING': return $t('budget.working')
    case 'DONE': return $t('budget.done')
    case 'CANCEL': return $t('budget.cancel')
    case 'DENY': return $t('budget.deny')
    default: return value
  }
}

const columns: ColumnDef<BudgetRow>[] = [
  { accessorKey: 'title', header: $t('budget.title') },
  { accessorKey: 'description', header: $t('budget.description') },
  { accessorKey: 'clientName', header: $t('budget.client') },
  {
    accessorKey: 'total',
    header: $t('budget.total'),
    cell: ({ row }) => {
      const v = row.getValue('total') as number
      return formatCurrency(v)
    }
  },
  {
    accessorKey: 'status',
    header: $t('budget.status'),
    cell: ({ row }) => {
      const rawStatus = (row.getValue('status') as string) || 'DRAFT'
      const v = (rawStatus in status ? rawStatus : 'DRAFT') as keyof typeof status
      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color: status[v] },
        () => statusLabel(rawStatus)
      )
    }
  },
  { accessorKey: 'observations', header: $t('budget.observations') },
  {
    id: 'actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'flex justify-end space-x-2' },
        [
          h(UButton, {
            icon: 'i-lucide-eye',
            color: 'neutral',
            variant: 'ghost',
            onClick: () => viewBudget(row.original)
          }),
          h(UButton, {
            icon: 'i-lucide-pencil',
            color: 'primary',
            variant: 'ghost',
            onClick: () => editBudget(row.original)
          }),
          h(UButton, {
            icon: 'i-lucide-trash',
            color: 'error',
            variant: 'ghost',
            onClick: () => deleteBudget(row.original.id ?? '')
          })
        ]
      )
  }
]
const router = useRouter()

function viewBudget(budget: BudgetRow) {
  router.push(`/budgets/${budget.id}/preview`)
}

function editBudget(row: BudgetRow) {
  selectedBudget.value = { ...row }
  edit.value = true
  openModal()
}

function showModal() {
  selectedBudget.value = null
  edit.value = false
  openModal()
}

function deleteBudget(id: string) {
  $budgetService.delete(id).then(() => {
    toast.add({
      title: $t('attention'),
      description: $t('budget.deletedSuccess'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    refresh()
  })
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="budgets" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-bold font-title text-2xl md:text-3xl">
            {{ $t('budgets') }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            {{ $t('budget.manage') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            :label="$t('common.refresh')"
            @click="refresh"
          />
          <UButton
            icon="i-lucide-filter-x"
            color="neutral"
            variant="outline"
            :label="$t('common.clearFilters')"
            @click="clearFilters"
          />
          <UButton
            :label="$t('newBudget')"
            icon="i-lucide-plus"
            class="bg-primary dark:bg-primary-dark"
            @click="showModal"
          />
        </div>
      </div>

      <UPageGrid class="mb-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <UPageCard
          :title="$t('budget.totalLoaded')"
          :description="`${cardsCount} ${$t('budget.itemsLabel')}`"
          icon="i-lucide-file-stack"
        />
        <UPageCard
          :title="$t('budget.approved')"
          :description="`${approvedCount} ${$t('budget.itemsLabel')}`"
          icon="i-lucide-badge-check"
        />
        <UPageCard
          :title="$t('budget.working')"
          :description="`${workingCount} ${$t('budget.itemsLabel')}`"
          icon="i-lucide-timer"
        />
        <UPageCard
          :title="$t('budget.pipelineValue')"
          :description="formatCurrency(pipelineValue)"
          icon="i-lucide-wallet-cards"
        />
      </UPageGrid>

      <UCard class="mb-6">
        <div class="grid gap-4 md:grid-cols-2">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="$t('budget.search')"
            @change="applyFilters"
          />
          <USelectMenu
            v-model="filter"
            icon="i-lucide-filter"
            :placeholder="$t('budget.filter')"
            :items="statusFilter"
            value-key="id"
            @change="applyFilters"
          />
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-for="item in quickFilterItems"
            :key="item.id || 'ALL'"
            size="xs"
            color="neutral"
            :variant="filter === item.id ? 'solid' : 'soft'"
            @click="setStatusFilter(item.id)"
          >
            {{ item.label }}
          </UButton>
        </div>
      </UCard>

      <div class="mt-6">
        <UEmpty
          v-if="!data?.length"
          icon="i-lucide-user"
          :title="$t('budget.noData')"
          :description="$t('budget.noDataDescription')"
        >
          <template #footer>
            <UButton
              :label="$t('newBudget')"
              class="bg-primary dark:bg-primary-dark"
              @click="showModal"
            />
          </template>
        </UEmpty>

        <div
          v-else
          class="space-y-3 md:hidden"
        >
          <div
            v-for="budgetRow in data"
            :key="budgetRow.id"
            class="rounded-lg border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold">
                  {{ budgetRow.title }}
                </p>
                <p class="text-sm text-muted">
                  {{ budgetRow.clientName || budgetRow.client }}
                </p>
              </div>
              <UBadge
                :color="status[(budgetRow.status || 'DRAFT') as keyof typeof status]"
                variant="subtle"
              >
                {{ statusLabel(budgetRow.status || 'DRAFT') }}
              </UBadge>
            </div>
            <p class="mt-2 line-clamp-2 text-sm text-muted">
              {{ budgetRow.description }}
            </p>
            <div class="mt-2 text-sm font-medium">
              {{ formatCurrency(budgetRow.total ?? 0) }}
            </div>
            <div class="mt-3 flex justify-end gap-2">
              <UButton
                size="xs"
                icon="i-lucide-eye"
                color="neutral"
                variant="ghost"
                @click="viewBudget(budgetRow)"
              />
              <UButton
                size="xs"
                icon="i-lucide-pencil"
                color="primary"
                variant="ghost"
                @click="editBudget(budgetRow)"
              />
              <UButton
                size="xs"
                icon="i-lucide-trash"
                color="error"
                variant="ghost"
                @click="deleteBudget(budgetRow.id ?? '')"
              />
            </div>
          </div>
        </div>

        <UTable
          class="hidden md:table"
          :columns="columns"
          :data="data"
        />

        <div class="hidden justify-end border-t border-default pt-4 px-4 md:flex">
          <UPagination
            :page="pagination.pageIndex + 1"
            :items-per-page="pagination.pageSize"
            :total="totalItems"
            @update:page="changePage"
          />
        </div>
      </div>
    </div>
    <BudgetModal
      ref="modalRef"
      :budget="selectedBudget"
      :mode="edit ? 'edit' : 'create'"
      @saved="refresh"
    />
  </div>
</template>
