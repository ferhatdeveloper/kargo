import { SegmentedControl } from '@mantine/core'
import { useLocale } from '@/hooks/useLocale'
import type { Locale } from '@/i18n/messages'

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale()

  return (
    <SegmentedControl
      size="xs"
      value={locale}
      onChange={(v) => setLocale(v as Locale)}
      aria-label={t('locale.label')}
      data={[
        { label: 'TR', value: 'tr' },
        { label: 'EN', value: 'en' },
      ]}
    />
  )
}
