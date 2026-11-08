<script setup lang="ts">
import SideBar from '~/components/SideBar.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $budgetService } = useNuxtApp()

const budgetId = route.params.id as string
const response = await $budgetService.findById(budgetId)
const budget = ref(response.data)
const approving = ref(false)
const exportingPdf = ref(false)
const sharingWhatsApp = ref(false)

function handleBack() {
  router.back()
}

const statusColor = {
  DRAFT: 'warning',
  SEND: 'info',
  WAITING: 'warning',
  APPROVED: 'success',
  WORKING: 'neutral',
  DONE: 'success',
  CANCEL: 'error',
  DENY: 'error',
  DELETED: 'error'
} as const

function statusLabel(value?: string) {
  if (!value) return '-'

  switch (value) {
    case 'DRAFT': return $t('budget.draft')
    case 'SEND': return $t('budget.send')
    case 'WAITING': return $t('budget.waiting')
    case 'APPROVED': return $t('budget.approved')
    case 'WORKING': return $t('budget.working')
    case 'DONE': return $t('budget.done')
    case 'CANCEL': return $t('budget.cancel')
    case 'DENY': return $t('budget.deny')
    case 'DELETED': return $t('budget.deleted')
    default: return value
  }
}

function getStatusColor(value?: string) {
  if (!value || !(value in statusColor)) return 'neutral'
  return statusColor[value as keyof typeof statusColor]
}

function itemTotal(quantity: number, price: number) {
  return quantity * price
}

const subtotal = computed(() =>
  (budget.value?.items ?? []).reduce((acc, item) => acc + itemTotal(item.quantity, item.price), 0)
)

const shouldShowApprove = computed(() =>
  budget.value?.status === 'DRAFT' || budget.value?.status === 'WAITING' || budget.value?.status === 'SEND'
)

const issuedAt = computed(() => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  return formatter.format(new Date())
})

const pdfFileName = computed(() => {
  const title = (budget.value?.title || 'budget')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
  return `orcamento-${title || budgetId}.pdf`
})

async function buildPdf() {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - (margin * 2)
  const lineHeight = 6
  let cursorY = margin

  const addPageIfNeeded = (requiredSpace = lineHeight) => {
    if (cursorY + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      cursorY = margin
    }
  }

  const writeLabelValue = (label: string, value: string) => {
    addPageIfNeeded(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text(label, margin, cursorY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(value, margin + 34, cursorY)
    cursorY += lineHeight
  }

  const writeWrappedBlock = (title: string, content: string) => {
    addPageIfNeeded(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text(title, margin, cursorY)
    cursorY += 6

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const text = content?.trim() ? content : '-'
    const lines = pdf.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      addPageIfNeeded(lineHeight)
      pdf.text(line, margin, cursorY)
      cursorY += lineHeight
    }
    cursorY += 2
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(budget.value?.title || $t('budget.previewTitle'), margin, cursorY)
  cursorY += 8

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`${$t('budget.documentNumber')}: #${budgetId}`, margin, cursorY)
  cursorY += lineHeight
  pdf.text(`${$t('budget.issueDate')}: ${issuedAt.value}`, margin, cursorY)
  cursorY += lineHeight
  pdf.text(`${$t('budget.client')}: ${budget.value?.clientName || budget.value?.client || '-'}`, margin, cursorY)
  cursorY += 8

  writeLabelValue(`${$t('budget.status')}:`, statusLabel(budget.value?.status))
  writeLabelValue(`${$t('budget.validate')}:`, `${budget.value?.validate ?? 0} ${$t('budget.validForDays')}`)
  writeLabelValue(`${$t('budget.subtotal')}:`, formatCurrency(subtotal.value))
  writeLabelValue(`${$t('budget.total')}:`, formatCurrency(budget.value?.total ?? subtotal.value))
  cursorY += 4

  writeWrappedBlock($t('budget.description'), budget.value?.description || '')

  addPageIfNeeded(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text($t('budget.items'), margin, cursorY)
  cursorY += 7

  const headers = [
    $t('budget.itemName'),
    $t('budget.itemDescription'),
    $t('budget.quantity'),
    $t('budget.price'),
    $t('budget.total')
  ]

  const colX = [margin, margin + 46, margin + 118, margin + 138, margin + 164]
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  headers.forEach((header, index) => {
    return pdf.text(header, colX[index]!, cursorY)
  })
  cursorY += 5
  pdf.setDrawColor(220, 220, 220)
  pdf.line(margin, cursorY, pageWidth - margin, cursorY)
  cursorY += 4

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  const items = budget.value?.items ?? []

  if (!items.length) {
    addPageIfNeeded()
    pdf.text($t('budget.noItems'), margin, cursorY)
    cursorY += lineHeight
  } else {
    for (const item of items) {
      const nameLines = pdf.splitTextToSize(item.name || '-', 40)
      const descLines = pdf.splitTextToSize(item.description || '-', 66)
      const rowLines = Math.max(nameLines.length, descLines.length, 1)
      const rowHeight = rowLines * 5 + 2

      addPageIfNeeded(rowHeight + 3)

      pdf.text(nameLines, colX[0]!, cursorY)
      pdf.text(descLines, colX[1]!, cursorY)
      pdf.text(String(item.quantity), colX[2]! + 14, cursorY, { align: 'right' })
      pdf.text(formatCurrency(item.price), colX[3]! + 22, cursorY, { align: 'right' })
      pdf.text(formatCurrency(itemTotal(item.quantity, item.price)), colX[4]! + 20, cursorY, { align: 'right' })

      cursorY += rowHeight
      pdf.setDrawColor(235, 235, 235)
      pdf.line(margin, cursorY - 2, pageWidth - margin, cursorY - 2)
    }
  }

  cursorY += 4
  writeWrappedBlock($t('budget.terms'), budget.value?.terms || $t('budget.noTerms'))
  writeWrappedBlock($t('budget.observations'), budget.value?.observations || $t('budget.noObservations'))

  return pdf
}

async function handleGeneratePdf() {
  exportingPdf.value = true
  try {
    const pdf = await buildPdf()
    pdf.save(pdfFileName.value)
    toast.add({
      title: $t('success'),
      description: $t('budget.pdfGenerated'),
      icon: 'i-lucide-file-down',
      color: 'success'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: $t('attention'),
      description: $t('budget.pdfError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    exportingPdf.value = false
  }
}

async function handleShareWhatsApp() {
  sharingWhatsApp.value = true
  try {
    const pdf = await buildPdf()
    const blob = pdf.output('blob')
    const file = new File([blob], pdfFileName.value, { type: 'application/pdf' })
    const message = $t('budget.whatsMessage', {
      title: budget.value?.title || '-',
      total: formatCurrency(budget.value?.total ?? subtotal.value)
    })

    if (import.meta.client && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: budget.value?.title || 'Budget',
        text: message
      })
      return
    }

    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = pdfFileName.value
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(downloadLink.href)

    if (import.meta.client) {
      const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(
        `${message}\n\n${$t('budget.whatsManualAttach')}`
      )}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }

    toast.add({
      title: $t('attention'),
      description: $t('budget.whatsFallbackInfo'),
      icon: 'i-lucide-message-circle',
      color: 'primary'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: $t('attention'),
      description: $t('budget.whatsError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    sharingWhatsApp.value = false
  }
}

async function handleApprove() {
  if (!budget.value) return

  approving.value = true
  try {
    const payload = {
      ...budget.value,
      status: 'APPROVED'
    }

    await $budgetService.update(budgetId, payload)
    budget.value.status = 'APPROVED'

    toast.add({
      title: $t('success'),
      description: $t('budget.updated'),
      icon: 'i-lucide-check-circle-2',
      color: 'success'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: $t('attention'),
      description: $t('errors.saveError'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
  } finally {
    approving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden">
    <SideBar
      active="budgets"
      class="print:hidden"
    />

    <div class="mx-auto w-full max-w-6xl flex-1 p-4 md:p-10">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-3 print:mb-4">
        <div>
          <h1 class="font-title text-2xl font-bold md:text-3xl">
            {{ budget?.title }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ budget?.clientName || budget?.client }}
          </p>
        </div>

        <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center print:hidden">
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="outline"
            size="sm"
            :label="$t('budget.back')"
            @click="handleBack"
          />
          <UButton
            icon="i-lucide-file-down"
            size="sm"
            :label="$t('budget.generatePdf')"
            :loading="exportingPdf"
            @click="handleGeneratePdf"
          />
          <UButton
            icon="i-lucide-message-circle"
            color="neutral"
            variant="outline"
            size="sm"
            :label="$t('budget.sendWhatsApp')"
            :loading="sharingWhatsApp"
            @click="handleShareWhatsApp"
          />
          <UButton
            v-if="shouldShowApprove"
            icon="i-lucide-check"
            size="sm"
            :label="$t('budget.approve')"
            :loading="approving"
            @click="handleApprove"
          />
        </div>
      </div>

      <div
        id="budget-pdf"
        class="mx-auto max-w-[980px] rounded-xl border border-default bg-white p-4 text-text shadow-sm md:p-8 dark:bg-dark"
      >
        <div class="mb-6 border-b border-default pb-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.12em] text-muted dark:text-white">
                {{ $t('budget.documentLabel') }}
              </p>
              <h2 class="mt-2 font-title dark:text-white text-2xl font-bold">
                {{ budget?.title }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ budget?.clientName || budget?.client }}
              </p>
            </div>

            <div class="text-left text-sm sm:text-right">
              <p class="text-muted">
                {{ $t('budget.documentNumber') }} #{{ budgetId }}
              </p>
              <p class="text-muted">
                {{ $t('budget.issueDate') }}: {{ issuedAt }}
              </p>
              <UBadge
                :color="getStatusColor(budget?.status)"
                variant="subtle"
                class="mt-2"
              >
                {{ statusLabel(budget?.status) }}
              </UBadge>
            </div>
          </div>
        </div>

        <UPageGrid class="mb-6">
          <UPageCard
            :title="$t('budget.status')"
            :description="statusLabel(budget?.status)"
            icon="i-lucide-flag"
          />
          <UPageCard
            :title="$t('budget.total')"
            :description="formatCurrency(budget?.total ?? subtotal)"
            icon="i-lucide-wallet-cards"
          />
          <UPageCard
            :title="$t('budget.validate')"
            :description="`${budget?.validate ?? 0} ${$t('budget.validForDays')}`"
            icon="i-lucide-calendar-days"
          />
          <UPageCard
            :title="$t('budget.items')"
            :description="`${budget?.items?.length ?? 0}`"
            icon="i-lucide-list-ordered"
          />
        </UPageGrid>

        <div class="mb-6 grid gap-6 xl:grid-cols-3">
          <UCard class="xl:col-span-2">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <h2 class="text-base font-bold md:text-lg dark:text-white">
                  {{ $t('budget.previewTitle') }}
                </h2>
              </div>
            </template>

            <p class="mb-4 whitespace-pre-line text-sm text-muted dark:text-white">
              {{ budget?.description }}
            </p>

            <div
              v-if="!budget?.items?.length"
              class="rounded-lg border border-dashed border-default p-4 text-sm text-muted dark:text-white"
            >
              {{ $t('budget.noItems') }}
            </div>

            <div
              v-else
              class="overflow-x-auto"
            >
              <table class="w-full min-w-[680px] text-left text-sm dark:text-white">
                <thead>
                  <tr class="border-b border-default">
                    <th class="py-2 pr-3 font-semibold">
                      {{ $t('budget.itemName') }}
                    </th>
                    <th class="py-2 pr-3 font-semibold">
                      {{ $t('budget.itemDescription') }}
                    </th>
                    <th class="py-2 pr-3 text-right font-semibold">
                      {{ $t('budget.quantity') }}
                    </th>
                    <th class="py-2 pr-3 text-right font-semibold">
                      {{ $t('budget.price') }}
                    </th>
                    <th class="py-2 text-right font-semibold">
                      {{ $t('budget.total') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in budget.items"
                    :key="`${item.name}-${index}`"
                    class="border-b border-default/60"
                  >
                    <td class="py-3 pr-3 font-medium">
                      {{ item.name }}
                    </td>
                    <td class="py-3 pr-3 text-muted">
                      {{ item.description }}
                    </td>
                    <td class="py-3 pr-3 text-right">
                      {{ item.quantity }}
                    </td>
                    <td class="py-3 pr-3 text-right">
                      {{ formatCurrency(item.price) }}
                    </td>
                    <td class="py-3 text-right font-semibold">
                      {{ formatCurrency(itemTotal(item.quantity, item.price)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-base font-bold md:text-lg dark:text-white">
                {{ $t('budget.total') }}
              </h2>
            </template>

            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm dark:text-white">
                <span class="text-muted">{{ $t('budget.subtotal') }}</span>
                <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">{{ $t('budget.status') }}</span>
                <UBadge
                  :color="getStatusColor(budget?.status)"
                  variant="subtle"
                >
                  {{ statusLabel(budget?.status) }}
                </UBadge>
              </div>
              <USeparator />
              <div class="flex items-center justify-between dark:text-white">
                <span class="font-semibold">{{ $t('budget.total') }}</span>
                <span class="text-xl font-bold">
                  {{ formatCurrency(budget?.total ?? subtotal) }}
                </span>
              </div>
            </div>
          </UCard>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="text-base font-bold md:text-lg dark:text-white">
                {{ $t('budget.terms') }}
              </h2>
            </template>

            <p class="whitespace-pre-line text-sm text-muted dark:text-white">
              {{ budget?.terms || $t('budget.noTerms') }}
            </p>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-base font-bold md:text-lg dark:text-white">
                {{ $t('budget.observations') }}
              </h2>
            </template>

            <p class="whitespace-pre-line text-sm text-muted dark:text-white">
              {{ budget?.observations || $t('budget.noObservations') }}
            </p>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
