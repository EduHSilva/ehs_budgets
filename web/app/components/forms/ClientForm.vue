<script setup lang="ts">
import { reactive, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Client } from '~/utils/types'

const props = defineProps<{
  client: Client | null
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'submitted', data: Client): void
}>()

const schema = z.object({
  name: z.string().min(1, { message: $t('errors.required') }),
  email: z.email({ message: $t('errors.invalidEmail') }),
  phone: z.string().min(1, { message: $t('errors.required') }),
  status: z.enum(['NEW', 'WORKING', 'DONE']).optional(),
  observations: z.string().optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  name: props.client?.name || '',
  email: props.client?.email || '',
  phone: props.client?.phone || '',
  status: (props.client?.status as Schema['status']) || 'NEW',
  observations: props.client?.observations || ''
})

watch(
  () => props.client,
  (client) => {
    state.name = client?.name || ''
    state.email = client?.email || ''
    state.phone = client?.phone || ''
    state.status = (client?.status as Schema['status']) || 'NEW'
    state.observations = client?.observations || ''
  }
)

const statusItems = [
  { label: $t('client.new'), id: 'NEW' },
  { label: $t('client.working'), id: 'WORKING' },
  { label: $t('client.done'), id: 'DONE' }
]

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submitted', {
    id: props.client?.id,
    name: event.data.name,
    email: event.data.email,
    phone: event.data.phone,
    status: event.data.status,
    observations: event.data.observations || ''
  })
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <UFormField
      :label="$t('client.name')"
      name="name"
    >
      <UInput
        v-model="state.name"
        icon="i-lucide-user"
        :placeholder="$t('client.form.namePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="$t('client.email')"
      name="email"
    >
      <UInput
        v-model="state.email"
        icon="i-lucide-mail"
        :placeholder="$t('client.form.emailPlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="$t('client.phone')"
      name="phone"
    >
      <UInput
        v-model="state.phone"
        icon="i-lucide-phone"
        :placeholder="$t('client.form.phonePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="mode === 'edit'"
      :label="$t('client.status')"
      name="status"
    >
      <USelectMenu
        v-model="state.status"
        :items="statusItems"
        value-key="id"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="$t('client.observations')"
      name="observations"
    >
      <UTextarea
        v-model="state.observations"
        :placeholder="$t('client.form.observationsPlaceholder')"
        autoresize
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <slot />
  </UForm>
</template>
