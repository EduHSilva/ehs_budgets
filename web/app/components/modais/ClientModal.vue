<script setup lang="ts">
import ClientForm from '~/components/forms/ClientForm.vue'
import type { Client } from '~/utils/types'

const open = ref(false)

const props = defineProps<{
  client: Client | null
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const loading = ref(false)
const toast = useToast()

function openModal() {
  open.value = true
}

function closeModal() {
  open.value = false
}

async function handleSubmit(data: Client) {
  const { $clientService } = useNuxtApp()
  loading.value = true

  try {
    let saved

    if (props.mode === 'edit' && props.client?.id) {
      saved = await $clientService.update(props.client.id, data)
    } else {
      saved = await $clientService.add(data)
    }

    if (!saved) {
      toast.add({
        title: $t('attention'),
        description: $t('errors.saveError'),
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      })
    } else {
      open.value = false
      emit('saved')

      toast.add({
        title: $t('success'),
        description: props.mode === 'edit'
          ? $t('client.updated')
          : $t('client.created'),
        icon: 'i-lucide-check',
        color: 'success'
      })
    }
  } catch (e) {
    toast.add({
      title: $t('attention'),
      description: $t('errors.saveError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    console.error(e)
  } finally {
    loading.value = false
  }
}

defineExpose({ openModal, closeModal })
</script>

<template>
  <UModal
    v-model:open="open"
    prevent-close
    class="max-w-5xl"
    fullscreen
    :title="mode === 'edit' ? $t('client.edit') : $t('client.new')"
  >
    <template #body>
      <ClientForm
        :client="client"
        :mode="mode"
        @submitted="handleSubmit"
      >
        <USeparator class="my-4" />

        <UButton
          type="submit"
          block
          :loading="loading"
          class="bg-primary dark:bg-primary-dark"
        >
          {{ mode === 'edit' ? $t('update') : $t('save') }}
        </UButton>
      </ClientForm>
    </template>
  </UModal>
</template>
