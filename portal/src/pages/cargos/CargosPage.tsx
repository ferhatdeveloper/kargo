import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconPackageExport, IconSearch } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { queryCargos } from '@/api/cargos'
import { useAuth } from '@/context/AuthContext'

const statusLabels: Record<number, string> = {
  1: 'Aktif',
  2: 'Tamamlandı',
  3: 'İptal',
}

export function CargosPage() {
  const { selectedAccountId } = useAuth()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cargos', selectedAccountId],
    queryFn: () =>
      queryCargos(selectedAccountId!, {
        page: 1,
        per_page: 25,
        fields: [
          { name: 'id' },
          { name: 'tracking_number' },
          { name: 'receiver_name' },
          { name: 'status' },
          { name: 'cargo_company.title' },
          { name: 'created_at' },
        ],
      }),
    enabled: !!selectedAccountId,
  })

  const items = (data?.items ?? []).filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.tracking_number?.toLowerCase().includes(q) ||
      c.receiver_name?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q)
    )
  })

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Kargolarım</Title>
          <Text c="dimmed" size="sm">
            Tüm gönderilerinizi listeleyin ve yönetin.
          </Text>
        </div>
        {selectedAccountId && (
          <Button
            component={Link}
            to={`/tr/accounts/${selectedAccountId}/cargos/create`}
            leftSection={<IconPackageExport size={18} />}
          >
            Yeni Kargo
          </Button>
        )}
      </Group>

      <Card withBorder padding="lg" radius="md">
        <TextInput
          placeholder="Alıcı adı, takip no veya sipariş no ara..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />

        {isLoading && (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        )}

        {isError && (
          <Text c="dimmed" ta="center" py="xl">
            Kargo listesi yüklenemedi. Hesabınızda henüz gönderi olmayabilir veya API geçici olarak
            yanıt vermiyor olabilir.
          </Text>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            Henüz kargo kaydı bulunmuyor. Yeni kargo oluşturarak başlayabilirsiniz.
          </Text>
        )}

        {items.length > 0 && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Takip No</Table.Th>
                <Table.Th>Alıcı</Table.Th>
                <Table.Th>Kargo Firması</Table.Th>
                <Table.Th>Durum</Table.Th>
                <Table.Th>Tarih</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((cargo) => (
                <Table.Tr key={cargo.id}>
                  <Table.Td>{cargo.tracking_number ?? '—'}</Table.Td>
                  <Table.Td>{cargo.receiver_name ?? '—'}</Table.Td>
                  <Table.Td>{cargo.cargo_company?.title ?? '—'}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">
                      {statusLabels[cargo.status ?? 0] ?? 'Bilinmiyor'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {cargo.created_at
                      ? new Date(cargo.created_at).toLocaleDateString('tr-TR')
                      : '—'}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  )
}
