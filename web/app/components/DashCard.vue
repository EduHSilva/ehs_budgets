<script setup lang="ts">
const props = defineProps({
  title: {
    required: true,
    type: String
  },
  icon: {
    required: true,
    type: String
  },
  content: {
    required: true,
    type: String
  },
  footer: {
    required: false,
    type: String
  }
})
</script>

<template>
  <UCard
    class="ehs-card mr-10 w-full"
    variant="soft"
    :ui="{ header: 'border-0', body: 'border-0', footer: 'p-0 h-10' }"
  >
    <template
      #header
    >
      <div class="flex h-2 w-full justify-between text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
        {{ props.title }}

        <div>
          <UIcon
            :name="props.icon"
            class="mx-auto size-5 text-primary"
          />
        </div>
      </div>
    </template>

    <div class="h-6 font-heading text-xl font-semibold tabular-nums">
      {{ props.content }}
    </div>

    <template
      v-if="footer"
      #footer
    >
      <div class="h-2 text-sm">
        {{ props.footer }}
      </div>
    </template>
  </UCard>
</template>
