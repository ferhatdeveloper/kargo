import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Group,
  NumberInput,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { useMemo, useState } from 'react'
import { fetchCargoQuote } from '@/api/shipping'
import { PRICING_CARRIER_TABS } from '@/config/stocadoCatalog'
import { useAuth } from '@/hooks/useAuth'
import { computeChargeableDesi, formatTry } from '@/lib/shipping'

const desiRows = Array.from({ length: 22 }, (_, i) => i)

export function PricingPlansPage() {
  const { selectedAccountId } = useAuth()
  const [carrier, setCarrier] = useState<string | null>(PRICING_CARRIER_TABS[0].code)
  const [length, setLength] = useState(30)
  const [width, setWidth] = useState(20)
  const [height, setHeight] = useState(15)
  const [weight, setWeight] = useState(2)
  const [pod, setPod] = useState(false)

  const desi = computeChargeableDesi(length, width, height, weight)

  const { data } = useQuery({
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

  const selectedQuote = useMemo(
    () => data?.quotes.find((q) => q.carrier_code === carrier),
    [data, carrier],
  )

  const tablePrices = useMemo(() => {
    if (!selectedQuote) return desiRows.map((d) => ({ desi: d, price: '—' }))
    const base = selectedQuote.price / Math.max(1, selectedQuote.chargeable_desi)
    return desiRows.map((d) => ({
      desi: d,
      price: formatTry(Math.round(base * Math.max(1, d) * 100) / 100),
    }))
  }, [selectedQuote])

  return (
    <Stack gap="lg">
      <Title order={2} className="stocado-page-title">
        Kargo Fiyat Listesi
      </Title>

      <Tabs
        value={carrier}
        onChange={setCarrier}
        variant="outline"
        styles={{ tab: { fontWeight: 600 } }}
      >
        <Tabs.List>
          {PRICING_CARRIER_TABS.map((c) => (
            <Tabs.Tab key={c.code} value={c.code}>
              {c.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Card withBorder padding="md" bg="blue.0">
        <Text size="sm" fw={600} mb={4}>
          {PRICING_CARRIER_TABS.find((c) => c.code === carrier)?.title} Bilgilendirmesi
        </Text>
        <Text size="sm">
          Adresinizden ücretsiz kurye alımı sağlanabilir. 30 desiye kadar standart fiyatlandırma
          uygulanır; üzeri için artan desi ücreti geçerlidir.
        </Text>
      </Card>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        <Card withBorder padding="lg" style={{ gridColumn: 'span 2' }}>
          <Group grow mb="md">
            <NumberInput label="En (cm)" value={length} onChange={(v) => setLength(Number(v) || 0)} />
            <NumberInput label="Boy (cm)" value={width} onChange={(v) => setWidth(Number(v) || 0)} />
            <NumberInput
              label="Yükseklik (cm)"
              value={height}
              onChange={(v) => setHeight(Number(v) || 0)}
            />
            <NumberInput
              label="Ağırlık (kg)"
              value={weight}
              onChange={(v) => setWeight(Number(v) || 0)}
            />
          </Group>
          <Switch
            label="Kapıda ödeme dahil"
            checked={pod}
            onChange={(e) => setPod(e.currentTarget.checked)}
            mb="md"
          />
          <Text fw={600} mb="sm">
            Normal Ücretler (örnek desi kademesi)
          </Text>
          <ScrollArea.Autosize mah={360}>
            <Table withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Desi Eşiği</Table.Th>
                  <Table.Th>Ücret (KDV Dahil)</Table.Th>
                  <Table.Th>Desi Eşiği</Table.Th>
                  <Table.Th>Ücret (KDV Dahil)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Array.from({ length: 11 }, (_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{tablePrices[i]?.desi}</Table.Td>
                    <Table.Td>{tablePrices[i]?.price}</Table.Td>
                    <Table.Td>{tablePrices[i + 11]?.desi}</Table.Td>
                    <Table.Td>{tablePrices[i + 11]?.price}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>
        </Card>

        <Card withBorder padding="lg">
          <Title order={5} mb="md">
            Ek Ücretler
          </Title>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">Artan Desi</Text>
              <Text fw={600}>{formatTry(23.34)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Seçili taşıyıcı teklif</Text>
              <Text fw={600} c="blue">
                {selectedQuote ? formatTry(selectedQuote.total) : '—'}
              </Text>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}
