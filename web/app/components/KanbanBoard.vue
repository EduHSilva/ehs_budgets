<script setup lang="ts">
import { VueDraggableNext as Draggable, type DragChangeEvent } from 'vue-draggable-next'
import type { Budget } from '~/utils/types'

const props = defineProps<{
  list: Budget[]
  handleChange: (evt: DragChangeEvent<Budget>, status: string) => Promise<void>
  title: string
  description: string
  color: 'orange' | 'blue' | 'green'
}>()

const colorMap = {
  orange: {
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    border: 'border-amber-500/20'
  },
  blue: {
    dot: 'bg-sky-500',
    ring: 'ring-sky-500/20',
    border: 'border-sky-500/20'
  },
  green: {
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    border: 'border-emerald-500/20'
  }
}

function budgetValue(item: Budget) {
  return formatCurrency(item.total ?? 0)
}
</script>

<template>
  <div
    class="flex h-[calc(100vh-16rem)] min-h-[34rem] flex-col rounded-xl border border-default bg-cards dark:bg-cards-dark shadow-sm"
    :class="[
      colorMap[color].border,
      colorMap[color].ring,
      'ring-1'
    ]"
  >
    <div class="border-b border-default px-4 py-3">
      <div class="flex items-center gap-2">
        <span
          class="h-2.5 w-2.5 rounded-full"
          :class="colorMap[color].dot"
        />
        <h3 class="font-semibold">
          {{ props.title }}
        </h3>
        <span class="ml-auto text-sm text-muted">
          {{ props.list.length }}
        </span>
      </div>
      <p class="mt-1 text-sm text-muted">
        {{ props.description }}
      </p>
    </div>

    <ClientOnly>
      <Draggable
        :list="props.list"
        group="kanban"
        class="flex-1 space-y-3 overflow-y-auto p-3"
        ghost-class="ghost"
        chosen-class="chosen"
        :animation="180"
        @change="handleChange"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="cursor-grab rounded-lg border border-default bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:bg-gray-900/50"
        >
          <div class="flex items-start justify-between gap-2">
            <h4 class="text-sm font-semibold leading-5">
              {{ item.title }}
            </h4>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              #{{ item.id?.slice?.(-4) || item.id }}
            </UBadge>
          </div>

          <p class="mt-2 text-sm text-muted">
            {{ item.clientName || item.client || $t('kanban.unknownClient') }}
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <UBadge
              icon="i-lucide-wallet"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ budgetValue(item) }}
            </UBadge>
            <UBadge
              icon="i-lucide-calendar-days"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ item.validate }}d
            </UBadge>
          </div>
        </div>

        <template #footer>
          <div
            v-if="!list.length"
            class="rounded-lg border border-dashed border-default p-4 text-center text-sm text-muted"
          >
            {{ $t('kanban.emptyColumn') }}
          </div>
        </template>
      </Draggable>
    </ClientOnly>

    <div class="border-t border-default px-4 py-2 text-xs text-muted">
      {{ $t('kanban.dragHint') }}
    </div>
  </div>
</template>
