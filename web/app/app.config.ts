/**
 * O Nuxt UI resolve `ui.colors.primary` pelo nome de uma escala existente no
 * tema do Tailwind (`--color-<nome>-<shade>`). A escala da marca é registrada
 * como `--color-brand-*` em assets/css/main.css e referenciada aqui.
 */
const colorName = 'brand'

export default defineAppConfig({
  ui: {
    colors: {
      primary: colorName,
      neutral: 'stone'
    },
    card: {
      slots: {
        root: 'rounded-2xl',
        header: 'border-0',
        body: 'border-0',
        footer: 'border-0'
      }
    },
    pageGrid: {
      base: 'relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
    },
    pageCard: {
      slots: {
        root: '[&]:rounded-2xl [&]:border-border [&]:shadow-[var(--ui-ehs-shadow-card)]',
        container: '[&]:gap-y-2 [&]:p-5',
        wrapper: 'gap-1',
        leading: '[&]:mb-1.5',
        leadingIcon: 'text-primary',
        title: '[&]:text-[12.5px] [&]:font-semibold [&]:uppercase [&]:tracking-[0.06em] [&]:text-muted',
        description: '[&]:font-heading [&]:text-[28px] [&]:font-semibold [&]:leading-none [&]:tracking-[-0.02em] [&]:text-highlighted [&]:tabular-nums'
      }
    },
    pageFeature: {
      slots: {
        leadingIcon: 'text-primary',
        title: '[&]:font-heading [&]:text-[16px] [&]:tracking-[-0.01em]',
        description: '[&]:text-[13px] [&]:text-muted'
      }
    },
    empty: {
      slots: {
        root: '[&]:rounded-xl [&]:border [&]:border-dashed [&]:border-[var(--ui-ehs-border-strong)] [&]:bg-[color-mix(in_srgb,var(--ui-ehs-bg)_55%,var(--ui-ehs-surface))]',
        title: '[&]:font-heading [&]:text-[17px] [&]:font-semibold [&]:tracking-[-0.01em]'
      }
    }
  }
})
