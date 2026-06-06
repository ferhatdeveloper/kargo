import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Group,
  Loader,
  Menu,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { BarChart, LineChart, DonutChart } from '@mantine/charts'
import {
  IconAlertTriangle,
  IconArrowBack,
  IconPackage,
  IconTruck,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { useState } from 'react'
import { fetchDashboardMetrics } from '@/api/dashboard'
import { useAuth } from '@/hooks/useAuth'

const metricDefs = [
  { key: 'pending' as const, label: 'Bekleyen Paketler', color: 'yellow', icon: IconPackage },
  { key: 'in_transit' as const, label: 'Yolda Olan Paketler', color: 'blue', icon: IconTruck },
  {
    key: 'delivered' as const,
    label: 'Teslim Edilen Paketler',
    color: 'teal',
    icon: IconTruckDelivery,
  },
  {
    key: 'problem' as const,
    label: 'Sorunlu Paketler',
    color: 'red',
    icon: IconAlertTriangle,
  },
  { key: 'returned' as const, label: 'Geri Dönen Paketler', color: 'orange', icon: IconArrowBack },
  { key: 'total' as const, label: 'TÜMÜ', color: 'gray', icon: IconPackage },
]

export function DashboardPage() {
  const { user, accounts, selectedAccountId } = useAuth()
  const account = accounts.find((a) => a.id === selectedAccountId)
  const [days, setDays] = useState(7)
  const [section, setSection] = useState<string | null>('cargos')

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', selectedAccountId, days],
    queryFn: () => fetchDashboardMetrics(selectedAccountId!, days),
    enabled: !!selectedAccountId,
  })

  const dailyChart =
    data?.daily?.map((d) => ({
      date: new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      Teslim: d.delivered,
      Transfer: Math.max(0, d.total - d.delivered),
      Toplam: d.total,
    })) ?? []

  const carrierChart =
    data?.by_carrier?.map((c) => ({
      name: c.title ?? 'Diğer',
      value: c.count,
    })) ?? []

  const completion =
    data && data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>İyi Çalışmalar {user?.first_name}</Title>
          <Text c="dimmed" size="sm">
            {account?.name}
          </Text>
        </div>
        <Menu shadow="md">
            <Menu.Target>
              <Card withBorder padding="xs" px="md" style={{ cursor: 'pointer' }}>
                <Text size="sm" fw={600}>
                  Son {days} gün
                </Text>
              </Card>
            </Menu.Target>
            <Menu.Dropdown>
              {[7, 14, 30].map((d) => (
                <Menu.Item key={d} onClick={() => setDays(d)}>
                  Son {d} gün
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
      </Group>

      <Tabs value={section} onChange={setSection}>
        <Tabs.List>
          <Tabs.Tab value="cargos">Kargolar</Tabs.Tab>
          <Tabs.Tab value="pod">Kapıda Ödemeler</Tabs.Tab>
          <Tabs.Tab value="finance">Finans</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {isLoading && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {!isLoading && data && (
        <>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
            {metricDefs.map((m) => (
              <Card key={m.key} withBorder padding="md" radius="md">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                      {m.label}
                    </Text>
                    <Text size="xl" fw={700} mt={4}>
                      {data[m.key]}
                    </Text>
                  </div>
                  <ThemeIcon size="lg" variant="light" color={m.color}>
                    <m.icon size={20} />
                  </ThemeIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <Card withBorder padding="lg">
              <Title order={4} mb="md">
                Gönderi ve Kargo Analiz Özeti
              </Title>
              <Tabs defaultValue="problem">
                <Tabs.List mb="md">
                  <Tabs.Tab value="problem">Sorunlu</Tabs.Tab>
                  <Tabs.Tab value="desi">Desi Değişmeleri</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="problem">
                  <Text size="sm" c="dimmed">
                    Sorunlu gönderi sayısı: <strong>{data.problem}</strong>
                  </Text>
                </Tabs.Panel>
                <Tabs.Panel value="desi">
                  <Text size="sm" c="dimmed">
                    Desi değişikliği takibi yakında grafik ile gösterilecek.
                  </Text>
                </Tabs.Panel>
              </Tabs>
            </Card>

            <Card withBorder padding="lg">
              <Title order={4} mb="md">
                Günlük Gönderi İstatistikleri
              </Title>
              {dailyChart.length > 0 ? (
                <LineChart
                  h={220}
                  data={dailyChart}
                  dataKey="date"
                  series={[
                    { name: 'Teslim', color: 'teal.6' },
                    { name: 'Transfer', color: 'yellow.6' },
                    { name: 'Toplam', color: 'blue.6' },
                  ]}
                  curveType="natural"
                />
              ) : (
                <Text c="dimmed" size="sm">
                  Seçilen dönemde gönderi yok.
                </Text>
              )}
            </Card>

            <Card withBorder padding="lg">
              <Title order={4} mb="md">
                Kargo Firmaları
              </Title>
              {carrierChart.length > 0 ? (
                <BarChart
                  h={220}
                  data={carrierChart}
                  dataKey="name"
                  series={[{ name: 'value', color: 'blue.6', label: 'Gönderi' }]}
                />
              ) : (
                <Text c="dimmed" size="sm">
                  Dağılım verisi yok.
                </Text>
              )}
            </Card>

            <Card withBorder padding="lg">
              <Title order={4} mb="md">
                Gönderi Sayısı
              </Title>
              <Group justify="center">
                <DonutChart
                  data={[
                    { name: 'Teslim', value: data.delivered, color: 'teal.6' },
                    {
                      name: 'Diğer',
                      value: Math.max(0, data.total - data.delivered),
                      color: 'gray.4',
                    },
                  ]}
                  chartLabel={`%${completion}`}
                  size={180}
                  thickness={24}
                />
              </Group>
            </Card>
          </SimpleGrid>
        </>
      )}
    </Stack>
  )
}
