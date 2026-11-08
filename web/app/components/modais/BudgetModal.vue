<script setup lang="ts">
import { ref } from 'vue'
import type { Budget } from '~/utils/types'
import BudgetForm from '~/components/forms/BudgetForm.vue'

const open = ref(false)

const props = defineProps<{
  budget: Budget | null
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const loading = ref(false)
const toast = useToast()

async function handleSubmit(data: Budget) {
  const { $budgetService } = useNuxtApp()
  loading.value = true

  try {
    let saved

    if (props.mode === 'edit' && props.budget?.id) {
      saved = await $budgetService.update(
        props.budget.id,
        data
      )
    } else {
      saved = await $budgetService.add(
        data
      )
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
          ? $t('budget.updated')
          : $t('budget.created'),
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

function closeModal() {
  open.value = false
}

function openModal() {
  open.value = true
}

defineExpose({
  closeModal, openModal
})
</script>

<template>
  <UModal
    v-model:open="open"
    prevent-close
    class="max-w-5xl"
    fullscreen
    :title="mode === 'edit' ? $t('budget.edit') : $t('budget.new')"
  >
    <template #body>
      <BudgetForm
        :budget="budget"
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
      </BudgetForm>
    </template>
  </UModal>
</template>
