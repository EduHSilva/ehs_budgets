<template>
  <div>
    <UPageSection class="pt-12 md:pt-18">
      <div class="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-4"
          >
            {{ $t('landingPage.badge') }}
          </UBadge>

          <h1 class="ehs-page-title !text-3xl !leading-tight md:!text-5xl">
            {{ $t('landingPage.easyOrcamentos') }}
          </h1>
          <p class="mt-4 max-w-xl text-base text-muted md:text-lg">
            {{ $t('landingPage.manageClients') }}
          </p>

          <div class="mt-6 flex flex-wrap gap-2">
            <UButton
              :label="$t('landingPage.startFree')"
              icon="i-lucide-arrow-right"
              to="/auth/register"
              class="ehs-btn-primary"
            />
            <UButton
              :label="$t('login')"
              icon="i-lucide-log-in"
              to="/auth/login"
              color="neutral"
              variant="outline"
            />
          </div>
        </div>

        <UCard class="ehs-card">
          <template #header>
            <h3 class="text-base font-bold md:text-lg">
              {{ $t('landingPage.flowCardTitle') }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ $t('landingPage.flowCardDescription') }}
            </p>
          </template>

          <ol class="space-y-3">
            <li class="ehs-card-soft flex items-start gap-3 p-3">
              <UBadge
                color="primary"
                variant="subtle"
              >
                01
              </UBadge>
              <div>
                <p class="text-sm font-semibold">
                  {{ $t('landingPage.flowStepClient') }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ $t('landingPage.flowStepClientDescription') }}
                </p>
              </div>
            </li>
            <li class="ehs-card-soft flex items-start gap-3 p-3">
              <UBadge
                color="primary"
                variant="subtle"
              >
                02
              </UBadge>
              <div>
                <p class="text-sm font-semibold">
                  {{ $t('landingPage.flowStepProposal') }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ $t('landingPage.flowStepProposalDescription') }}
                </p>
              </div>
            </li>
            <li class="ehs-card-soft flex items-start gap-3 p-3">
              <UBadge
                color="primary"
                variant="subtle"
              >
                03
              </UBadge>
              <div>
                <p class="text-sm font-semibold">
                  {{ $t('landingPage.flowStepApproval') }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ $t('landingPage.flowStepApprovalDescription') }}
                </p>
              </div>
            </li>
            <li class="ehs-card-soft flex items-start gap-3 p-3">
              <UBadge
                color="primary"
                variant="subtle"
              >
                04
              </UBadge>
              <div>
                <p class="text-sm font-semibold">
                  {{ $t('landingPage.flowStepKanban') }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ $t('landingPage.flowStepKanbanDescription') }}
                </p>
              </div>
            </li>
          </ol>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection
      :title="$t('landingPage.allYouNeed')"
      :description="$t('landingPage.featuresPlanning')"
    >
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UCard class="ehs-card">
          <UIcon
            name="i-lucide-users"
            class="mb-3 size-5 text-primary"
          />
          <h3 class="font-semibold">
            {{ $t('landingPage.clientsManagement') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.clientsManagementDescription') }}
          </p>
        </UCard>

        <UCard class="ehs-card">
          <UIcon
            name="i-lucide-kanban"
            class="mb-3 size-5 text-primary"
          />
          <h3 class="font-semibold">
            {{ $t('landingPage.projects') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.projectsDescription') }}
          </p>
        </UCard>

        <UCard class="ehs-card">
          <UIcon
            name="i-lucide-badge-check"
            class="mb-3 size-5 text-primary"
          />
          <h3 class="font-semibold">
            {{ $t('landingPage.onlineApproval') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.onlineApprovalDescription') }}
          </p>
        </UCard>

        <UCard class="ehs-card">
          <UIcon
            name="i-lucide-layout-dashboard"
            class="mb-3 size-5 text-primary"
          />
          <h3 class="font-semibold">
            {{ $t('landingPage.dashboardCompleted') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.dashboardCompletedDescription') }}
          </p>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection
      :title="$t('landingPage.howItWorksTitle')"
      :description="$t('landingPage.howItWorksDescription')"
    >
      <div class="grid gap-4 md:grid-cols-3">
        <UCard class="ehs-card">
          <UBadge
            color="neutral"
            variant="subtle"
          >
            01
          </UBadge>
          <h3 class="mt-3 font-semibold">
            {{ $t('landingPage.stepOneTitle') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.stepOneDescription') }}
          </p>
        </UCard>

        <UCard class="ehs-card">
          <UBadge
            color="neutral"
            variant="subtle"
          >
            02
          </UBadge>
          <h3 class="mt-3 font-semibold">
            {{ $t('landingPage.stepTwoTitle') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.stepTwoDescription') }}
          </p>
        </UCard>

        <UCard class="ehs-card">
          <UBadge
            color="neutral"
            variant="subtle"
          >
            03
          </UBadge>
          <h3 class="mt-3 font-semibold">
            {{ $t('landingPage.stepThreeTitle') }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ $t('landingPage.stepThreeDescription') }}
          </p>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        :title="$t('landingPage.readyToOrganize')"
        :description="$t('landingPage.seeDifference')"
        :links="[{
          label: $t('landingPage.startFree'),
          to: '/auth/register',
          trailingIcon: 'i-lucide-arrow-right',
          class: 'ehs-btn-primary'
        }, {
          label: $t('landingPage.aboutMore'),
          to: '/auth/login',
          icon: 'i-lucide-log-in',
          color: 'neutral',
          variant: 'outline'
        }]"
        :ui="{ container: 'ehs-card' }"
      />
    </UPageSection>
  </div>
</template>
