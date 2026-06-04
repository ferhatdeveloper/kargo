import { Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import {
  IconCashBanknote,
  IconPackage,
  IconTruckDelivery,
  IconTrendingUp,
} from '@tabler/icons-react'
import { useAuth } from '@/context/AuthContext'

const statCards = [
  { label: 'Toplam Kargo', value: '—', icon: IconPackage, color: 'blue' },
  { label: 'Teslim Edilen', value: '—', icon: IconTruckDelivery, color: 'teal' },
  { label: 'Kapıda Ödeme', value: '—', icon: IconCashBanknote, color: 'yellow' },
  { label: 'Bu Ay Gönderi', value: '—', icon: IconTrendingUp, color: 'indigo' },
]

export function DashboardPage() {
  const { accounts, selectedAccountId } = useAuth()
  const account = accounts.find((a) => a.id === selectedAccountId)

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Gösterge Panelim</Title>
        <Text c="dimmed" size="sm" mt={4}>
          {account?.name} — Hoş geldiniz. Kargo özetiniz ve analizleriniz burada görüntülenir.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {statCards.map((s) => (
          <Card key={s.label} withBorder padding="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {s.label}
                </Text>
                <Text size="xl" fw={700} mt={4}>
                  {s.value}
                </Text>
              </div>
              <ThemeIcon size="xl" radius="md" variant="light" color={s.color}>
                <s.icon size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Gönderi ve Kargo Analiz Özeti
          </Title>
          <Text c="dimmed" size="sm">
            Şehir haritası, kargo firması dağılımı ve durum grafikleri bu alanda gösterilir. API
            bağlantısı ile canlı veri çekilebilir.
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Kapıda Ödeme Özeti
          </Title>
          <Text c="dimmed" size="sm">
            {account?.can_pod
              ? 'Kapıda ödeme tahsilat ve ödeme takvim bilgileri burada listelenir.'
              : 'Bu hesap için kapıda ödeme özelliği aktif değil.'}
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}
