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
    class="w-full mr-10 bg-cards dark:bg-cards-dark"
    variant="soft"
    :ui="{ header: 'border-0 font-title font-bold', body: 'border-0', footer: 'p-0 h-10' }"
  >
    <template
      #header
    >
      <div class="h-2 flex justify-between w-full">
        {{ props.title }}

        <div>
          <UIcon
            :name="props.icon"
            class="size-5 text-primary mx-auto"
          />
        </div>
      </div>
    </template>

    <div class="h-6 text-xl font-bold">
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
