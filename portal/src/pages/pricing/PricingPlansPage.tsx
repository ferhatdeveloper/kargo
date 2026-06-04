import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { fetchCargoQuote } from '@/api/shipping'
import { CarrierQuoteCompare } from '@/components/cargo/CarrierQuoteCompare'
import { useAuth } from '@/hooks/useAuth'
import { computeChargeableDesi, formatTry } from '@/lib/shipping'

export function PricingPlansPage() {
  const { selectedAccountId } = useAuth()
  const [length, setLength] = useState(30)
  const [width, setWidth] = useState(20)
  const [height, setHeight] = useState(15)
  const [weight, setWeight] = useState(2)
  const [pod, setPod] = useState(false)

  const desi = computeChargeableDesi(length, width, height, weight)

  const { data, isFetching } = useQuery({
    queryKey: ['pricing-compare', selectedAccountId, length, width, height, weight, pod],
    queryFn: () =>
      fetchCargoQuote(selectedAccountId!, {
        length_cm: length,
        width_cm: width,
        height_cm: height,
        weight_kg: weight,
        pay_on_delivery: pod,
      }),
    enabled: !!selectedAccountId && desi > 0,
  })

  const cheapest = data?.quotes.find((q) => q.is_cheapest)
  const expensive = data?.quotes[data.quotes.length - 1]

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Kargo fiyat karşılaştırması</Title>
        <Text c="dimmed" size="sm">
          Paket ölçülerine göre taşıyıcıların anlık fiyat tekliflerini görün.
        </Text>
      </div>

      <Card withBorder padding="lg">
        <Group grow align="flex-end">
          <NumberInput label="En (cm)" min={0} value={length} onChange={(v) => setLength(Number(v) || 0)} />
          <NumberInput label="Boy (cm)" min={0} value={width} onChange={(v) => setWidth(Number(v) || 0)} />
          <NumberInput
            label="Yükseklik (cm)"
            min={0}
            value={height}
            onChange={(v) => setHeight(Number(v) || 0)}
          />
          <NumberInput
            label="Ağırlık (kg)"
            min={0}
            decimalScale={2}
            value={weight}
            onChange={(v) => setWeight(Number(v) || 0)}
          />
        </Group>
        <Switch
          label="Kapıda ödeme dahil hesapla"
          mt="md"
          checked={pod}
          onChange={(e) => setPod(e.currentTarget.checked)}
        />
        <Text mt="md" fw={600}>
          Hesaplanan desi: {desi.toFixed(2)}
        </Text>
        {cheapest && expensive && cheapest.carrier_id !== expensive.carrier_id && (
          <Text size="sm" c="dimmed" mt={4}>
            Bu ölçüde fark: {formatTry(expensive.total - cheapest.total)} (
            {cheapest.title} → {expensive.title})
          </Text>
        )}
      </Card>

      <CarrierQuoteCompare
        quotes={data?.quotes ?? []}
        selectedId={cheapest?.carrier_id ?? null}
        onSelect={() => {}}
        loading={isFetching}
      />
    </Stack>
  )
}
