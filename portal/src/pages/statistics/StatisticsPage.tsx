import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'
import { fetchDashboardMetrics } from '@/api/dashboard'
import { AccountFinanceBadges } from '@/components/layout/AccountFinanceBadges'
import { useAuth } from '@/hooks/useAuth'

export function StatisticsPage() {
  const { selectedAccountId } = useAuth()
  const [range, setRange] = useState('1')
  const days = Number(range) * 30

  const { data } = useQuery({
    queryKey: ['statistics', selectedAccountId, days],
    queryFn: () => fetchDashboardMetrics(selectedAccountId!, days),
    enabled: !!selectedAccountId,
  })

  const deliveryRate =
    data && data.total > 0 ? ((data.delivered / data.total) * 100).toFixed(1) : '0'

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>İstatistikler</Title>
          <Text c="dimmed" size="sm">
            Kargo performansı, teslimat ve iade analizleri
          </Text>
        </div>
        <Group>
          <SegmentedControl
            value={range}
            onChange={setRange}
            data={[
              { label: '1 Ay', value: '1' },
              { label: '3 Ay', value: '3' },
              { label: '6 Ay', value: '6' },
              { label: '1 Yıl', value: '12' },
            ]}
          />
          <AccountFinanceBadges accountId={selectedAccountId} />
        </Group>
      </Group>

      <Alert
        icon={<IconAlertTriangle size={18} />}
        color="yellow"
        title="3 adet akıllı uyarı"
        variant="light"
      >
        <Stack gap={4}>
          <Text size="sm">Teslimat oranı son dönemde değişti (%{deliveryRate})</Text>
          <Text size="sm">{data?.pod_open ?? 0} kapıda ödeme tahsil edilmedi</Text>
          <Text size="sm">Taşıyıcı performansını karşılaştırma sekmesinden inceleyin</Text>
        </Stack>
      </Alert>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Genel Bakış</Tabs.Tab>
          <Tabs.Tab value="performance">Performans</Tabs.Tab>
          <Tabs.Tab value="finance">Finansal</Tabs.Tab>
          <Tabs.Tab value="trends">Hedefler & Trend</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
            <Card withBorder padding="lg" style={{ borderTop: '3px solid var(--mantine-color-blue-6)' }}>
              <Text size="xs" c="dimmed">
                Toplam Kargo
              </Text>
              <Text size="xl" fw={800}>
                {data?.total ?? '—'}
              </Text>
              <Text size="xs" c="dimmed">
                Son {range} ay
              </Text>
            </Card>
            <Card withBorder padding="lg" style={{ borderTop: '3px solid var(--mantine-color-teal-6)' }}>
              <Text size="xs" c="dimmed">
                Teslimat Oranı
              </Text>
              <Text size="xl" fw={800}>
                %{deliveryRate}
              </Text>
              <Text size="xs" c="dimmed">
                Başarılı teslimatlar
              </Text>
            </Card>
            <Card withBorder padding="lg" style={{ borderTop: '3px solid var(--mantine-color-red-6)' }}>
              <Text size="xs" c="dimmed">
                İade Oranı
              </Text>
              <Text size="xl" fw={800}>
                %{data && data.total > 0 ? ((data.returned / data.total) * 100).toFixed(1) : '0'}
              </Text>
            </Card>
            <Card
              withBorder
              padding="lg"
              style={{ borderTop: '3px solid var(--mantine-color-orange-6)' }}
            >
              <Text size="xs" c="dimmed">
                Kapıda Ödeme
              </Text>
              <Text size="xl" fw={800}>
                {data?.pod_open ?? '—'}
              </Text>
              <Text size="xs" c="dimmed">
                Açık tahsilat
              </Text>
            </Card>
          </SimpleGrid>

          <Card withBorder padding="lg">
            <Title order={4} mb="md">
              Dönem Karşılaştırması
            </Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Metrik</Table.Th>
                  <Table.Th>Bu Dönem</Table.Th>
                  <Table.Th>Önceki</Table.Th>
                  <Table.Th>Değişim</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Toplam Kargo</Table.Td>
                  <Table.Td>{data?.total ?? 0}</Table.Td>
                  <Table.Td>—</Table.Td>
                  <Table.Td>—</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Teslimat Oranı</Table.Td>
                  <Table.Td>%{deliveryRate}</Table.Td>
                  <Table.Td>—</Table.Td>
                  <Table.Td>—</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {['performance', 'finance', 'trends'].map((tab) => (
          <Tabs.Panel key={tab} value={tab} pt="md">
            <Card withBorder padding="xl">
              <Text c="dimmed">Detaylı {tab} raporları genişletilecek.</Text>
            </Card>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
