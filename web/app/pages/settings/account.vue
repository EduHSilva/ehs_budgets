<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import SideBar from '~/components/SideBar.vue'
import { useUser } from '~/plugins/userService'
import type { UserDetails } from '~/utils/types'

const { t, locale, setLocale } = useI18n()
const toast = useToast()
const { $userService } = useNuxtApp()

const user = useUser()
const details = ref<UserDetails | null>(null)
const loading = ref(true)
const saving = ref(false)

const form = reactive({
  username: '',
  email: ''
})

const languageItems = computed(() => ([
  { label: t('accountPage.languagePtBr'), value: 'pt' },
  { label: t('accountPage.languageEnUs'), value: 'en' }
]))

const language = computed({
  get: () => locale.value,
  set: (value: string) => setLocale(value as 'pt' | 'en')
})

const statusLabels: Record<string, string> = {
  OK: 'accountPage.statusOk',
  WAITING_CONFIRMATION: 'accountPage.statusWaiting',
  BLOCKED: 'accountPage.statusBlocked'
}

function statusLabel(value?: string) {
  if (!value) return '-'
  const key = statusLabels[value]
  return key ? t(key) : value
}

function statusColor(value?: string) {
  if (value === 'OK') return 'success'
  if (value === 'BLOCKED') return 'error'
  return 'warning'
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const initials = computed(() => {
  const name = form.username || user.value?.username || ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?'
})

onMounted(async () => {
  const current = user.value
  if (!current?.id) {
    loading.value = false
    return
  }

  form.username = current.username ?? ''
  form.email = current.email ?? ''

  try {
    details.value = (await $userService.findById(current.id)).data
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('attention'),
      description: t('accountPage.loadError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
})

async function saveChanges() {
  const current = user.value
  if (!current?.id) return

  if (!form.username.trim()) {
    toast.add({
      title: t('attention'),
      description: t('errors.required'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    return
  }

  saving.value = true
  try {
    const response = await $userService.update(current.id, {
      username: form.username.trim(),
      email: form.email.trim()
    })

    details.value = response.data
    form.username = response.data.username
    form.email = response.data.email
    user.value = {
      ...current,
      username: response.data.username,
      email: response.data.email
    }

    toast.add({
      title: t('success'),
      description: t('accountPage.saved'),
      icon: 'i-lucide-check-circle-2',
      color: 'success'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('attention'),
      description: t('errors.saveError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="settings account" />

    <div class="w-full min-w-0 flex-1 p-4 md:p-8 md:pr-10">
      <div class="mb-6">
        <h1 class="ehs-page-title">
          {{ $t('accountPage.title') }}
        </h1>
        <p class="mt-1.5 max-w-2xl text-sm text-muted">
          {{ $t('accountPage.description') }}
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <UCard>
          <template #header>
            <h2 class="ehs-section-title">
              {{ $t('accountPage.profileCard') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="form.username"
                :text="initials"
                size="xl"
              />
              <div class="min-w-0">
                <p class="truncate font-medium">
                  {{ form.username || '-' }}
                </p>
                <p class="truncate text-sm text-muted">
                  {{ form.email || '-' }}
                </p>
              </div>
            </div>

            <USeparator />

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted">{{ $t('accountPage.accountStatus') }}</span>
              <UBadge
                :color="statusColor(details?.status)"
                variant="subtle"
              >
                {{ statusLabel(details?.status) }}
              </UBadge>
            </div>

            <div class="space-y-1">
              <p class="text-sm text-muted">
                {{ $t('accountPage.roles') }}
              </p>
              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="role in details?.roles ?? []"
                  :key="role"
                  color="primary"
                  variant="subtle"
                >
                  {{ role }}
                </UBadge>
                <span
                  v-if="!details?.roles?.length"
                  class="text-sm text-muted"
                >-</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted">{{ $t('accountPage.company') }}</span>
              <span class="text-sm font-medium">{{ details?.companyName || '-' }}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted">{{ $t('accountPage.createdAt') }}</span>
              <span class="text-sm">{{ formatDate(details?.createdDate) }}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted">{{ $t('accountPage.lastAccess') }}</span>
              <span class="text-sm">{{ formatDate(user?.lastLogin) }}</span>
            </div>
          </div>
        </UCard>

        <UCard class="xl:col-span-2">
          <template #header>
            <h2 class="ehs-section-title">
              {{ $t('accountPage.personalInfo') }}
            </h2>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <UInput
              v-model="form.username"
              :label="$t('accountPage.fullName')"
              autocomplete="name"
            />
            <UFormField
              :label="$t('email')"
              :help="$t('accountPage.emailHint')"
            >
              <UInput
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="w-full"
              />
            </UFormField>
            <USelectMenu
              v-model="language"
              value-key="value"
              :items="languageItems"
              :label="$t('accountPage.language')"
              class="md:col-span-2"
            />
            <p class="text-sm text-muted md:col-span-2">
              {{ $t('accountPage.languageHint') }}
            </p>
          </div>

          <div class="mt-4 flex justify-end">
            <UButton
              :label="$t('accountPage.saveChanges')"
              icon="i-lucide-save"
              size="sm"
              :loading="saving"
              :disabled="loading"
              class="ehs-btn-primary"
              @click="saveChanges"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
