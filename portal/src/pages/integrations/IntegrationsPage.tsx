import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { fetchIntegrations } from '@/api/integrations'
import { AccountFinanceBadges } from '@/components/layout/AccountFinanceBadges'
import { MARKETPLACE_PROVIDERS } from '@/config/stocadoCatalog'
import { useAuth } from '@/hooks/useAuth'

export function IntegrationsPage() {
  const { selectedAccountId } = useAuth()
  const [tab, setTab] = useState<string | null>('marketplace')
  const [search, setSearch] = useState('')

  const { data: connected = [] } = useQuery({
    queryKey: ['integrations', selectedAccountId],
    queryFn: () => fetchIntegrations(selectedAccountId!),
    enabled: !!selectedAccountId,
  })

  const connectedCodes = new Set(connected.map((c) => c.provider_code))

  const providers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MARKETPLACE_PROVIDERS.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.code.includes(q),
    )
  }, [search])

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Entegrasyonlar</Title>
        <AccountFinanceBadges accountId={selectedAccountId} />
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="marketplace">Pazaryeri Entegrasyonları</Tabs.Tab>
          <Tabs.Tab value="invoice">Fatura Entegrasyonları</Tabs.Tab>
          <Tabs.Tab value="api">API Entegrasyonu</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="marketplace" pt="md">
          <Group justify="flex-end" mb="md">
            <TextInput
              placeholder="Ara..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={280}
            />
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {providers.map((p) => {
              const isConnected = connectedCodes.has(p.code)
              return (
                <Card key={p.code} withBorder padding="lg" radius="md" h="100%">
                  <Stack justify="space-between" h="100%">
                    <div>
                      <Text fw={700} size="lg" mb="xs">
                        {p.title}
                      </Text>
                      <Text size="sm" c="dimmed" mb="sm">
                        {p.description}
                      </Text>
                      {p.note && (
                        <Text size="xs" c="dimmed">
                          {p.note}
                        </Text>
                      )}
                    </div>
                    <Group gap="xs" mt="md">
                      <Badge color={isConnected ? 'teal' : 'gray'} variant="light">
                        {isConnected ? 'Bağlı' : 'Bağlı Değil'}
                      </Badge>
                      {p.comingSoon ? (
                        <Button disabled fullWidth variant="default">
                          Çok Yakında
                        </Button>
                      ) : p.connectable ? (
                        <Button fullWidth variant="filled">
                          Bağlan
                        </Button>
                      ) : (
                        <Button fullWidth variant="default" disabled>
                          Bağlı Değil
                        </Button>
                      )}
                    </Group>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="invoice" pt="md">
          <Card withBorder padding="xl">
            <Text c="dimmed">
              E-fatura ve e-arşiv entegrasyonları bu sekmeden yönetilir. PostgREST üzerinden
              bağlantı kayıtları eklenebilir.
            </Text>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="api" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder padding="lg">
                <Title order={4} mb="sm">
                  API Anahtarı
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                  Sistem entegrasyonları için API anahtarınızı oluşturun ve güvenli saklayın.
                </Text>
                <Button variant="light">Yeni anahtar oluştur</Button>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
