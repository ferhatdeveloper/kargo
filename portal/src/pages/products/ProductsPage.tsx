import { useQuery } from '@tanstack/react-query'
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { queryProducts } from '@/api/products'
import { AccountFinanceBadges } from '@/components/layout/AccountFinanceBadges'
import { ListToolbar } from '@/components/table/ListToolbar'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime, formatMoneyTry } from '@/lib/format'

export function ProductsPage() {
  const { selectedAccountId } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 350)
  const [page, setPage] = useState(1)
  const perPage = 25

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', selectedAccountId, page, debouncedSearch],
    queryFn: () => queryProducts(selectedAccountId!, page, perPage, debouncedSearch),
    enabled: !!selectedAccountId,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Ürünlerim</Title>
        <Group>
          <AccountFinanceBadges accountId={selectedAccountId} />
          <Button leftSection={<IconPlus size={16} />}>Yeni Ürün Ekle</Button>
        </Group>
      </Group>

      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Tab value="all">Tümü</Tabs.Tab>
          <Tabs.Tab value="add" disabled>
            +
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => void refetch()}
        onOpenFilters={() => {}}
      />

      {isLoading && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {!isLoading && items.length > 0 && (
        <ScrollArea.Autosize mah={480}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Ürün Adı</Table.Th>
                <Table.Th>Ürün Kodu</Table.Th>
                <Table.Th>Fiyat</Table.Th>
                <Table.Th>En</Table.Th>
                <Table.Th>Boy</Table.Th>
                <Table.Th>Yükseklik</Table.Th>
                <Table.Th>Desi</Table.Th>
                <Table.Th>Oluşturma Tarihi</Table.Th>
                <Table.Th>Aktif</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {p.id.slice(0, 18)}…
                    </Text>
                  </Table.Td>
                  <Table.Td>{p.title}</Table.Td>
                  <Table.Td>{p.sku}</Table.Td>
                  <Table.Td>{formatMoneyTry(p.unit_price)}</Table.Td>
                  <Table.Td>{p.width_cm ?? '—'}</Table.Td>
                  <Table.Td>{p.height_cm ?? '—'}</Table.Td>
                  <Table.Td>{p.length_cm ?? '—'}</Table.Td>
                  <Table.Td>{p.desi ?? '—'}</Table.Td>
                  <Table.Td>{formatDateTime(p.created_at)}</Table.Td>
                  <Table.Td>
                    <Checkbox checked={p.is_active} readOnly aria-label="Aktif" />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon color="red" variant="subtle" aria-label="Sil">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} / {total}
        </Text>
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Stack>
  )
}
