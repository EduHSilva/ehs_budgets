<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'

const { t } = useI18n()

const profile = ref({
  name: 'Eduardo Silva',
  role: 'Administrador',
  email: 'contato@ehssolutions.app',
  phone: '+55 (11) 98888-1020',
  company: 'EHS Solutions',
  document: '22.456.890/0001-14',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  bio: 'Designer e freelancer com foco em projetos digitais para PMEs.'
})

const languageItems = computed(() => ([
  { label: t('accountPage.languagePtBr'), value: 'pt-BR' },
  { label: t('accountPage.languageEnUs'), value: 'en-US' }
]))

const timezoneItems = computed(() => ([
  { label: t('accountPage.timezoneSaoPaulo'), value: 'America/Sao_Paulo' },
  { label: t('accountPage.timezoneLisbon'), value: 'Europe/Lisbon' },
  { label: t('accountPage.timezoneNewYork'), value: 'America/New_York' }
]))

const communicationSettings = ref({
  emailUpdates: true,
  whatsappUpdates: true,
  marketingEmails: false
})

const sessions = [
  { device: 'Chrome · Windows', location: 'São Paulo, BR', current: true, lastAccess: '25/04/2026 09:12' },
  { device: 'Safari · iPhone', location: 'São Paulo, BR', current: false, lastAccess: '24/04/2026 18:03' },
  { device: 'Edge · Notebook', location: 'Campinas, BR', current: false, lastAccess: '22/04/2026 11:44' }
]
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar active="settings account" />

    <div class="flex-1 p-4 md:p-10 md:pr-12">
      <div class="mb-6">
        <h1 class="font-bold font-title text-2xl md:text-3xl">
          {{ $t('accountPage.title') }}
        </h1>
        <p class="mt-1 max-w-2xl text-sm text-muted">
          {{ $t('accountPage.description') }}
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('accountPage.profileCard') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="profile.name"
                icon="i-lucide-user"
                size="xl"
              />
              <div>
                <p class="font-medium">
                  {{ profile.name }}
                </p>
                <p class="text-sm text-muted">
                  {{ profile.role }}
                </p>
              </div>
            </div>

            <USeparator />

            <div class="space-y-2">
              <p class="text-sm text-muted">
                {{ $t('accountPage.lastAccess') }}
              </p>
              <p class="font-medium">
                25/04/2026 às 09:12
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-sm text-muted">
                {{ $t('accountPage.currentPlan') }}
              </p>
              <UBadge
                color="primary"
                variant="subtle"
              >
                {{ $t('accountPage.planName') }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard class="xl:col-span-2">
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('accountPage.personalInfo') }}
            </h2>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <UInput
              v-model="profile.name"
              :label="$t('accountPage.fullName')"
            />
            <UInput
              v-model="profile.email"
              :label="$t('email')"
              type="email"
            />
            <UInput
              v-model="profile.phone"
              :label="$t('client.phone')"
            />
            <UInput
              v-model="profile.company"
              :label="$t('accountPage.company')"
            />
            <UInput
              v-model="profile.document"
              :label="$t('accountPage.document')"
            />

            <USelectMenu
              v-model="profile.timezone"
              value-key="value"
              :items="timezoneItems"
              :label="$t('accountPage.timezone')"
            />
            <USelectMenu
              v-model="profile.language"
              value-key="value"
              :items="languageItems"
              :label="$t('accountPage.language')"
            />
            <UTextarea
              v-model="profile.bio"
              :label="$t('accountPage.bio')"
              class="md:col-span-2"
              :rows="3"
            />
          </div>

          <div class="mt-4 flex justify-end">
            <UButton
              :label="$t('accountPage.saveChanges')"
              icon="i-lucide-save"
              size="sm"
            />
          </div>
        </UCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-2 mt-6">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('accountPage.communicationTitle') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('accountPage.emailUpdates') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('accountPage.emailUpdatesHint') }}
                </p>
              </div>
              <USwitch v-model="communicationSettings.emailUpdates" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('accountPage.whatsappUpdates') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('accountPage.whatsappUpdatesHint') }}
                </p>
              </div>
              <USwitch v-model="communicationSettings.whatsappUpdates" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium">
                  {{ $t('accountPage.marketingUpdates') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('accountPage.marketingUpdatesHint') }}
                </p>
              </div>
              <USwitch v-model="communicationSettings.marketingEmails" />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-lg">
              {{ $t('accountPage.activeSessions') }}
            </h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="session in sessions"
              :key="`${session.device}-${session.lastAccess}`"
              class="rounded-lg border border-default p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="font-medium">
                  {{ session.device }}
                </p>
                <UBadge
                  v-if="session.current"
                  color="success"
                  variant="subtle"
                >
                  {{ $t('accountPage.currentSession') }}
                </UBadge>
              </div>
              <p class="text-sm text-muted mt-1">
                {{ session.location }} · {{ session.lastAccess }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
