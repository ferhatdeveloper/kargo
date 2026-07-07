import { Box, Divider, Group, Stack, Text } from '@mantine/core'
import type { LabelSettings } from '@/types/shipping'
import { formatTry } from '@/lib/shipping'

export interface LabelPreviewData {
  senderName: string
  senderLine: string
  receiverName: string
  receiverLine: string
  receiverPhone?: string
  carrierTitle: string
  trackingNumber: string
  referenceBarcode?: string
  desi?: number
  podAmount?: number
  accountName?: string
}

interface ShippingLabelPreviewProps {
  settings: LabelSettings
  data: LabelPreviewData
  printId?: string
}

const formatSizes: Record<LabelSettings['format'], { width: number; minHeight: number }> = {
  '100x150': { width: 280, minHeight: 420 },
  '100x100': { width: 280, minHeight: 280 },
  A6: { width: 300, minHeight: 424 },
}

const fontScale: Record<LabelSettings['font_size'], number> = {
  sm: 0.85,
  md: 1,
  lg: 1.15,
}

export function ShippingLabelPreview({
  settings,
  data,
  printId = 'kargomkapinda-shipping-label',
}: ShippingLabelPreviewProps) {
  const size = formatSizes[settings.format]
  const scale = fontScale[settings.font_size]
  const compact = settings.layout === 'compact'

  return (
    <Box
      id={printId}
      style={{
        width: size.width,
        minHeight: size.minHeight,
        border: '2px dashed #ced4da',
        borderRadius: 8,
        padding: compact ? 10 : 14,
        background: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: `${12 * scale}px`,
        lineHeight: 1.35,
      }}
    >
      {settings.show_logo && (
        <Group justify="space-between" mb={compact ? 6 : 10}>
          <Text fw={800} style={{ color: settings.accent_color }}>
            Kargom Kapında
          </Text>
          {data.accountName && (
            <Text size="xs" c="dimmed" ta="right">
              {data.accountName}
            </Text>
          )}
        </Group>
      )}

      <Text fw={700} size={compact ? 'xs' : 'sm'} tt="uppercase" c="dimmed">
        Gönderici
      </Text>
      <Text fw={600}>{data.senderName}</Text>
      <Text size="xs" mb={compact ? 6 : 10}>
        {data.senderLine}
      </Text>

      <Divider my={compact ? 6 : 8} color={settings.accent_color} />

      <Text fw={700} size={compact ? 'xs' : 'sm'} tt="uppercase" c="dimmed">
        Alıcı
      </Text>
      <Text fw={700} size={compact ? 'sm' : 'md'}>
        {data.receiverName}
      </Text>
      {data.receiverPhone && (
        <Text size="xs" fw={600}>
          Tel: {data.receiverPhone}
        </Text>
      )}
      <Text size="xs" mb={compact ? 6 : 10}>
        {data.receiverLine}
      </Text>

      <Group justify="space-between" align="flex-end">
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            Taşıyıcı
          </Text>
          <Text fw={700}>{data.carrierTitle}</Text>
          {data.desi != null && (
            <Text size="xs">Desi: {data.desi.toFixed(2)}</Text>
          )}
          {data.podAmount != null && data.podAmount > 0 && (
            <Text size="xs" fw={700} style={{ color: settings.accent_color }}>
              K.Ö: {formatTry(data.podAmount)}
            </Text>
          )}
        </Stack>
      </Group>

      {settings.show_barcode && (
        <Box
          mt={compact ? 8 : 12}
          p={8}
          style={{
            border: `1px solid ${settings.accent_color}`,
            borderRadius: 4,
            textAlign: 'center',
            letterSpacing: 2,
            fontFamily: 'monospace',
            fontSize: `${14 * scale}px`,
            fontWeight: 700,
          }}
        >
          {data.trackingNumber || 'ÖNİZLEME-BARKOD'}
        </Box>
      )}

      {settings.show_reference && data.referenceBarcode && (
        <Text size="xs" ta="center" mt={6} c="dimmed">
          Ref: {data.referenceBarcode}
        </Text>
      )}
    </Box>
  )
}
