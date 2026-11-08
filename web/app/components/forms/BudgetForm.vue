<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Budget, Client } from '~/utils/types'

const props = defineProps<{
  budget: Budget | null
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'submitted', data: Budget): void
}>()

const { $clientService } = useNuxtApp()

const response = await $clientService.find(0, null, null, 100)

const clientsRaw = ref<Client[]>(response.data.items || [])

const items = ref(
  clientsRaw.value.map((client: Client) => ({
    label: client.name,
    id: client.id
  }))
)

const schema = z.object({
  title: z.string().min(1, { message: $t('errors.required') }),
  description: z.string().min(1, { message: $t('errors.required') }),
  client: z.string().min(1, { message: $t('errors.required') }),
  validate: z.number().min(1, { message: $t('errors.required') }),
  items: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: $t('errors.required') }),
    description: z.string().min(1, { message: $t('errors.required') }),
    quantity: z.number().min(1, { message: $t('errors.required') }),
    price: z.number().min(1, { message: $t('errors.required') })
  })).min(1, { message: $t('errors.required') }),
  terms: z.string().optional(),
  observations: z.string().optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  title: '',
  description: '',
  client: '',
  validate: 1,
  items: [],
  terms: '',
  observations: ''
})

watch(
  () => [props.budget],
  ([budget]) => {
    if (budget) {
      state.title = props.budget?.title || ''
      state.description = props.budget?.description || ''
      state.items = props.budget?.items || []
      state.client = props.budget?.client || ''
      state.validate = props.budget?.validate || 1
      state.terms = props.budget?.terms || ''
      state.observations = props.budget?.observations || ''
    }

    if (!budget) {
      state.title = ''
      state.description = ''
      state.observations = ''
    }
  },
  { immediate: true }
)

function onSubmit(event: FormSubmitEvent<Schema>) {
  const budget: Budget = {
    title: event.data.title,
    description: event.data.description || '',
    client: event.data.client,
    validate: event.data.validate,
    items: event.data.items,
    terms: event.data.terms,
    observations: event.data.observations
  }
  if (props.mode === 'edit' && props.budget?.id) {
    emit('submitted', budget)
  } else {
    emit('submitted', budget)
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-8"
    @submit="onSubmit"
  >
    <UFormField
      :label="$t('budget.title')"
      name="title"
    >
      <UInput
        v-model="state.title"
        :placeholder="$t('budget.form.titlePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        :label="$t('budget.client')"
        name="client"
      >
        <USelectMenu
          v-model="state.client"
          :items="items"
          value-key="id"
          class="w-full"
          :disabled="mode === 'edit'"
        />
      </UFormField>

      <UFormField
        :label="$t('budget.validate') + ' (d) '"
        name="validate"
      >
        <UInput
          v-model="state.validate"
          class="w-full"
          type="number"
        />
      </UFormField>
    </div>

    <UFormField
      :label="$t('budget.description')"
      name="description"
    >
      <UTextarea
        v-model="state.description"
        :placeholder="$t('budget.form.descriptionPlaceholder')"
        autoresize
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <div class="space-y-4 border p-4 rounded-md">
      <h3 class="text-lg font-semibold">
        {{ $t('budget.items') }}
      </h3>

      <div
        v-for="(item, index) in state.items"
        :key="index"
        class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
      >
        <UFormField
          :label="$t('budget.itemName')"
          :name="`items.${index}.name`"
        >
          <UInput
            v-model="item.name"
            :placeholder="$t('budget.form.itemNamePlaceholder')"
          />
        </UFormField>

        <UFormField
          :label="$t('budget.itemDescription')"
          :name="`items.${index}.description`"
        >
          <UInput
            v-model="item.description"
            :placeholder="$t('budget.form.itemDescriptionPlaceholder')"
          />
        </UFormField>

        <UFormField
          :label="$t('budget.quantity')"
          :name="`items.${index}.quantity`"
        >
          <UInput
            v-model.number="item.quantity"
            type="number"
            min="1"
          />
        </UFormField>

        <UFormField
          :label="$t('budget.price')"
          :name="`items.${index}.price`"
        >
          <UInput
            v-model.number="item.price"
            type="number"
            min="0"
          />
        </UFormField>

        <div class="flex justify-center pt-6">
          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="soft"
            @click="state.items.splice(index, 1)"
          />
        </div>
      </div>

      <UButton
        icon="i-lucide-plus"
        class="bg-primary dark:bg-primary-dark"
        @click="state.items.push({ name: '', description: '', quantity: 1, price: 0 })"
      >
        {{ $t('budget.addItem') }}
      </UButton>

      <div class="flex justify-end text-sm text-gray-300 mt-2">
        {{ $t('budget.subtotal') }}:
        <span class="ml-1 font-semibold">
          {{ formatCurrency(
            state.items.reduce(
              (acc, i) => acc + i.quantity * i.price,
              0
            )
          ) }}
        </span>
      </div>
    </div>

    <div class="flex justify-end text-xl font-bold pr-2">
      {{ $t('budget.total') }}:
      <span class="ml-2">
        {{ formatCurrency(
          state.items.reduce(
            (acc, i) => acc + i.quantity * i.price,
            0
          )
        ) }}
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        :label="$t('budget.terms')"
        name="terms"
      >
        <UTextarea
          v-model="state.terms"
          autoresize
          :rows="4"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="$t('budget.observations')"
        name="observations"
      >
        <UTextarea
          v-model="state.observations"
          autoresize
          :rows="4"
          class="w-full"
        />
      </UFormField>
      <slot />
    </div>
  </UForm>
</template>
