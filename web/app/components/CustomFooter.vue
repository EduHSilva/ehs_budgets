<script setup lang="ts">
</script>

<template>
  <div class="print:hidden">
    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          EHS Solutions • EHS Orçamentos • © {{ new Date().getFullYear() }}
          <a href="/app/privacidade/" class="ml-2 text-primary hover:underline">{{ $t('privacyPolicy') }}</a>
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/EduHSilva"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
