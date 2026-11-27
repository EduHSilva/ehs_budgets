<script setup lang="ts">
import type { Budget } from '~/utils/types'

const route = useRoute()
const { $budgetService } = useNuxtApp()
const toast = useToast()

const token = String(route.params.token || '')
const budget = ref<Budget | null>(null)
const loading = ref(true)
const loadFailed = ref(false)
const deciding = ref(false)

try {
  const { data } = await $budgetService.findPublic(token)
  budget.value = data
} catch (e) {
  console.error(e)
  loadFailed.value = true
} finally {
  loading.value = false
}

type BadgeColor = 'warning' | 'info' | 'success' | 'neutral' | 'error'

const statusColors: Record<string, BadgeColor> = {
  DRAFT: 'warning',
  SEND: 'info',
  WAITING: 'warning',
  APPROVED: 'success',
  WORKING: 'neutral',
  DONE: 'success',
  CANCEL: 'error',
  DENY: 'error',
  DELETED: 'error'
}

function statusLabel(value?: string) {
  switch (value) {
    case 'DRAFT': return $t('budget.draft')
    case 'SEND': return $t('budget.send')
    case 'WAITING': return $t('budget.waiting')
    case 'APPROVED': return $t('budget.approved')
    case 'WORKING': return $t('budget.working')
    case 'DONE': return $t('budget.done')
    case 'CANCEL': return $t('budget.cancel')
    case 'DENY': return $t('budget.deny')
    default: return value || '-'
  }
}

function getStatusColor(value?: string): BadgeColor {
  return (value && statusColors[value]) || 'neutral'
}

function itemTotal(quantity: number, price: number) {
  return quantity * price
}

const subtotal = computed(() =>
  (budget.value?.items ?? []).reduce((acc, item) => acc + itemTotal(item.quantity, item.price), 0)
)

// O cliente só decide enquanto o orçamento está aguardando (SEND é legado).
const canDecide = computed(() => ['WAITING', 'SEND'].includes(budget.value?.status || ''))
const decisionNotice = computed(() => {
  if (budget.value?.status === 'APPROVED') return $t('approval.approvedNotice')
  if (budget.value?.status === 'DENY') return $t('approval.deniedNotice')
  return $t('approval.closedNotice')
})

async function decide(status: 'APPROVED' | 'DENY') {
  deciding.value = true
  try {
    const { data } = await $budgetService.decidePublic(token, status)
    budget.value = { ...budget.value, ...data }

    toast.add({
      title: $t('success'),
      description: status === 'APPROVED'
        ? $t('approval.approveSuccess')
        : $t('approval.denySuccess'),
      icon: status === 'APPROVED' ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle',
      color: status === 'APPROVED' ? 'success' : 'error'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: $t('attention'),
      description: $t('approval.decisionError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    deciding.value = false
  }
}
</script>

<template>
  <main class="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
    <div
      v-if="loading"
      class="ehs-card flex items-center justify-center gap-3 p-10 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 animate-spin"
      />
      {{ $t('approval.loading') }}
    </div>

    <div
      v-else-if="loadFailed || !budget"
      class="ehs-card p-8 text-center md:p-12"
    >
      <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-elevated">
        <UIcon
          name="i-lucide-link-2-off"
          class="size-6 text-muted"
        />
      </div>
      <h1 class="mt-4 ehs-page-title">
        {{ $t('approval.invalidTitle') }}
      </h1>
      <p class="mx-auto mt-2 max-w-md text-sm text-muted">
        {{ $t('approval.invalidDescription') }}
      </p>
    </div>

    <template v-else>
      <section class="ehs-card p-5 md:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4 border-b border-default pb-5">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {{ $t('approval.badge') }}
            </p>
            <h1 class="mt-2 ehs-page-title">
              {{ budget.title }}
            </h1>
            <p class="mt-1 text-sm text-muted">
              {{ budget.clientName || budget.client }}
            </p>
          </div>

          <div class="text-left text-sm sm:text-right">
            <UBadge
              :color="getStatusColor(budget.status)"
              variant="subtle"
            >
              {{ statusLabel(budget.status) }}
            </UBadge>
            <p class="mt-2 text-muted">
              {{ $t('budget.validate') }}: {{ budget.validate ?? 0 }} {{ $t('budget.validForDays') }}
            </p>
          </div>
        </div>

        <div
          v-if="canDecide"
          class="mt-5 rounded-xl border border-default bg-elevated/40 p-4"
        >
          <p class="text-sm font-medium">
            {{ $t('approval.title') }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ $t('approval.subtitle') }}
          </p>

          <div class="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            <UButton
              icon="i-lucide-check"
              :label="$t('approval.approve')"
              :loading="deciding"
              class="ehs-btn-primary justify-center"
              @click="decide('APPROVED')"
            />
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="outline"
              :label="$t('approval.deny')"
              :disabled="deciding"
              class="justify-center"
              @click="decide('DENY')"
            />
          </div>
        </div>

        <div
          v-else
          class="mt-5 flex items-start gap-3 rounded-xl border border-default bg-elevated/40 p-4"
        >
          <UIcon
            :name="budget.status === 'APPROVED' ? 'i-lucide-check-circle-2' : budget.status === 'DENY' ? 'i-lucide-x-circle' : 'i-lucide-info'"
            class="mt-0.5 size-5 shrink-0"
            :class="budget.status === 'APPROVED' ? 'text-success' : budget.status === 'DENY' ? 'text-error' : 'text-muted'"
          />
          <p class="text-sm">
            {{ decisionNotice }}
          </p>
        </div>
      </section>

      <section class="ehs-card mt-4 p-5 md:p-8">
        <h2 class="ehs-section-title">
          {{ $t('budget.previewTitle') }}
        </h2>

        <p
          v-if="budget.description"
          class="mt-3 whitespace-pre-line text-sm text-muted"
        >
          {{ budget.description }}
        </p>

        <div
          v-if="!budget.items?.length"
          class="ehs-empty mt-4 p-4 text-sm"
        >
          {{ $t('budget.noItems') }}
        </div>

        <div
          v-else
          class="mt-4 overflow-x-auto"
        >
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="py-2 pr-3 font-semibold">
                  {{ $t('budget.itemName') }}
                </th>
                <th class="py-2 pr-3 font-semibold">
                  {{ $t('budget.itemDescription') }}
                </th>
                <th class="py-2 pr-3 text-right font-semibold">
                  {{ $t('budget.quantity') }}
                </th>
                <th class="py-2 pr-3 text-right font-semibold">
                  {{ $t('budget.price') }}
                </th>
                <th class="py-2 text-right font-semibold">
                  {{ $t('budget.total') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in budget.items"
                :key="`${item.name}-${index}`"
                class="border-b border-default/60"
              >
                <td class="py-3 pr-3 font-medium">
                  {{ item.name }}
                </td>
                <td class="py-3 pr-3 text-muted">
                  {{ item.description }}
                </td>
                <td class="py-3 pr-3 text-right">
                  {{ item.quantity }}
                </td>
                <td class="py-3 pr-3 text-right">
                  {{ formatCurrency(item.price) }}
                </td>
                <td class="py-3 text-right font-semibold">
                  {{ formatCurrency(itemTotal(item.quantity, item.price)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-default pt-4">
          <span class="font-semibold">{{ $t('budget.total') }}</span>
          <span class="text-xl font-bold">
            {{ formatCurrency(budget.total ?? subtotal) }}
          </span>
        </div>
      </section>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="ehs-section-title">
              {{ $t('budget.terms') }}
            </h2>
          </template>

          <p class="whitespace-pre-line text-sm text-muted">
            {{ budget.terms || $t('budget.noTerms') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="ehs-section-title">
              {{ $t('budget.observations') }}
            </h2>
          </template>

          <p class="whitespace-pre-line text-sm text-muted">
            {{ budget.observations || $t('budget.noObservations') }}
          </p>
        </UCard>
      </div>
    </template>
  </main>
</template>
