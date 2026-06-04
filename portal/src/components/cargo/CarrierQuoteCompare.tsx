import {
  Badge,
  Card,
  Group,
  Radio,
  SimpleGrid,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { IconClock, IconTruck } from '@tabler/icons-react'
import type { CarrierQuote } from '@/types/shipping'
import { formatTry } from '@/lib/shipping'

interface CarrierQuoteCompareProps {
  quotes: CarrierQuote[]
  selectedId: string | null
  onSelect: (carrierId: string) => void
  loading?: boolean
}

export function CarrierQuoteCompare({
  quotes,
  selectedId,
  onSelect,
  loading,
}: CarrierQuoteCompareProps) {
  if (loading) {
    return (
      <Text c="dimmed" ta="center" py="md">
        Fiyatlar hesaplanıyor…
      </Text>
    )
  }

  if (quotes.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md">
        Paket ölçülerini girerek taşıyıcı fiyatlarını karşılaştırın.
      </Text>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {quotes.map((q) => {
        const selected = selectedId === q.carrier_id
        return (
          <Card
            key={q.carrier_id}
            withBorder
            padding="md"
            radius="md"
            style={{
              cursor: 'pointer',
              borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
              borderWidth: selected ? 2 : 1,
            }}
            onClick={() => onSelect(q.carrier_id)}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              <Group gap="xs">
                <Radio checked={selected} onChange={() => onSelect(q.carrier_id)} />
                <div>
                  <Text fw={700}>{q.title}</Text>
                  <Text size="xs" c="dimmed">
                    {q.chargeable_desi.toFixed(2)} desi
                  </Text>
                </div>
              </Group>
              {q.is_cheapest && (
                <Badge color="teal" variant="filled">
                  En uygun
                </Badge>
              )}
            </Group>

            <Text size="xl" fw={800} c="blue">
              {formatTry(q.total)}
            </Text>
            <Text size="xs" c="dimmed">
              Kargo: {formatTry(q.price)}
              {q.pod_fee > 0 ? ` + K.Ö: ${formatTry(q.pod_fee)}` : ''}
            </Text>

            <Group gap="lg" mt="sm">
              <Group gap={4}>
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconClock size={14} />
                </ThemeIcon>
                <Text size="xs">{q.estimated_days} gün</Text>
              </Group>
              {q.supports_pod && (
                <Group gap={4}>
                  <ThemeIcon size="sm" variant="light" color="yellow">
                    <IconTruck size={14} />
                  </ThemeIcon>
                  <Text size="xs">K.Ö destekli</Text>
                </Group>
              )}
            </Group>
          </Card>
        )
      })}
    </SimpleGrid>
  )
}
