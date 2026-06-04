import { ColorInput, Group, Select, Stack, Switch, Text, Title } from '@mantine/core'
import type { LabelSettings } from '@/types/shipping'

interface LabelDesignerProps {
  value: LabelSettings
  onChange: (next: LabelSettings) => void
}

export function LabelDesigner({ value, onChange }: LabelDesignerProps) {
  const patch = (partial: Partial<LabelSettings>) => onChange({ ...value, ...partial })

  return (
    <Stack gap="sm">
      <Title order={5}>Etiket tasarımı</Title>
      <Text size="sm" c="dimmed">
        Yazdırılacak kargo etiketinin boyutunu ve görünür alanlarını özelleştirin.
      </Text>
      <Group grow>
        <Select
          label="Etiket boyutu"
          data={[
            { value: '100x150', label: '100 × 150 mm (termal)' },
            { value: '100x100', label: '100 × 100 mm' },
            { value: 'A6', label: 'A6' },
          ]}
          value={value.format}
          onChange={(v) => v && patch({ format: v as LabelSettings['format'] })}
        />
        <Select
          label="Düzen"
          data={[
            { value: 'standard', label: 'Standart' },
            { value: 'compact', label: 'Kompakt' },
          ]}
          value={value.layout}
          onChange={(v) => v && patch({ layout: v as LabelSettings['layout'] })}
        />
      </Group>
      <Select
        label="Yazı boyutu"
        data={[
          { value: 'sm', label: 'Küçük' },
          { value: 'md', label: 'Orta' },
          { value: 'lg', label: 'Büyük' },
        ]}
        value={value.font_size}
        onChange={(v) => v && patch({ font_size: v as LabelSettings['font_size'] })}
      />
      <ColorInput
        label="Vurgu rengi"
        value={value.accent_color}
        onChange={(c) => patch({ accent_color: c })}
      />
      <Switch
        label="Firma logosu göster"
        checked={value.show_logo}
        onChange={(e) => patch({ show_logo: e.currentTarget.checked })}
      />
      <Switch
        label="Barkod alanı"
        checked={value.show_barcode}
        onChange={(e) => patch({ show_barcode: e.currentTarget.checked })}
      />
      <Switch
        label="Referans barkod"
        checked={value.show_reference}
        onChange={(e) => patch({ show_reference: e.currentTarget.checked })}
      />
    </Stack>
  )
}
