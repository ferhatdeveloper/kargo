import { useQuery } from '@tanstack/react-query'
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconCopy } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { queryCargos } from '@/api/cargos'
import { AccountFinanceBadges } from '@/components/layout/AccountFinanceBadges'
import { CargoFiltersDrawer } from '@/components/cargo/CargoFiltersDrawer'
import { ListToolbar } from '@/components/table/ListToolbar'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime, formatMoneyTry } from '@/lib/format'
import type { CargoFilters, CargoListItem, CargoListTab } from '@/types/cargo'

function movementColor(movement?: string) {
  if (movement === 'Teslim Edildi') return 'teal'
  if (movement === 'Entegrasyon Hatası') return 'red'
  if (movement === 'Dağıtımda' || movement === 'Transferde') return 'cyan'
  return 'blue'
}

function copyText(label: string, value?: string) {
  if (!value) return
  void navigator.clipboard.writeText(value)
  notifications.show({ message: `${label} kopyalandı`, color: 'blue' })
}

export function CargosPage() {
  const { selectedAccountId } = useAuth()
  const [tab, setTab] = useState<CargoListTab>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 350)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState('10')
  const [filters, setFilters] = useState<CargoFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cargos', selectedAccountId, tab, page, perPage, debouncedSearch, filters],
    queryFn: () =>
      queryCargos(selectedAccountId!, {
        page,
        per_page: Number(perPage),
        tab,
        search: debouncedSearch,
        filters,
      }),
    enabled: !!selectedAccountId,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / Number(perPage)))

  const filterChips = useMemo(() => {
    const chips: { key: string; label: string }[] = []
    if (filters.last_movements?.length) {
      chips.push({
        key: 'movements',
        label: `Son Hareket: ${filters.last_movements[0]}${filters.last_movements.length > 1 ? ` +${filters.last_movements.length - 1}` : ''}`,
      })
    }
    if (filters.created_from) {
      chips.push({
        key: 'created',
        label: `Oluşturma Tarihi: ${new Date(filters.created_from).toLocaleDateString('tr-TR')}`,
      })
    }
    if (filters.pay_on_delivery === true) {
      chips.push({ key: 'pod', label: 'Kapıda Ödeme: Evet' })
    }
    return chips
  }, [filters])

  const renderAllTable = (rows: CargoListItem[]) => (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={40}>
            <Checkbox aria-label="Tümünü seç" />
          </Table.Th>
          <Table.Th>Gönderici</Table.Th>
          <Table.Th>Alıcı</Table.Th>
          <Table.Th>Alıcı İl</Table.Th>
          <Table.Th>Alıcı İlçe</Table.Th>
          <Table.Th>Alıcı Tel</Table.Th>
          <Table.Th>Son Hareket</Table.Th>
          <Table.Th>Kapıda Ödeme Tutarı</Table.Th>
          <Table.Th>Oluşturma Tarihi</Table.Th>
          <Table.Th>Taşıyıcı Barkod</Table.Th>
          <Table.Th>Referans Barkod</Table.Th>
          <Table.Th>Kargo Firması</Table.Th>
          <Table.Th>Son Hareket Açıklama</Table.Th>
          <Table.Th>Durum</Table.Th>
          <Table.Th>Desi</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((c) => (
          <Table.Tr key={c.id}>
            <Table.Td>
              <Checkbox aria-label="Satır seç" />
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={500}>
                {c.sender_name ?? '—'}
              </Text>
              <Text size="xs" c="dimmed">
                {c.sender_company ?? ''}
              </Text>
            </Table.Td>
            <Table.Td>{c.receiver_name ?? '—'}</Table.Td>
            <Table.Td>{c.receiver_city ?? '—'}</Table.Td>
            <Table.Td>{c.receiver_district ?? '—'}</Table.Td>
            <Table.Td>{c.receiver_phone ?? '—'}</Table.Td>
            <Table.Td>
              <Badge color={movementColor(c.last_movement)} variant="light">
                {c.last_movement ?? '—'}
              </Badge>
            </Table.Td>
            <Table.Td>
              {c.pod_amount != null && c.pay_on_delivery ? (
                <Badge color="blue">{formatMoneyTry(c.pod_amount)}</Badge>
              ) : (
                '—'
              )}
            </Table.Td>
            <Table.Td>{formatDateTime(c.created_at)}</Table.Td>
            <Table.Td>
              <Group gap={4} wrap="nowrap">
                <Text size="sm" ff="monospace">
                  {c.carrier_barcode ?? '—'}
                </Text>
                <Tooltip label="Kopyala">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => copyText('Barkod', c.carrier_barcode)}
                  >
                    <IconCopy size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
            <Table.Td>
              <Group gap={4} wrap="nowrap">
                <Text size="sm" ff="monospace">
                  {c.reference_barcode ?? '—'}
                </Text>
                <Tooltip label="Kopyala">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => copyText('Referans', c.reference_barcode)}
                  >
                    <IconCopy size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
            <Table.Td>{c.cargo_company?.title ?? '—'}</Table.Td>
            <Table.Td>{c.last_movement_description ?? '—'}</Table.Td>
            <Table.Td>
              <Badge variant="light" color="blue">
                {c.status === 2 ? 'Tamamlandı' : c.status === 3 ? 'İptal' : 'Aktif'}
              </Badge>
            </Table.Td>
            <Table.Td>{c.desi != null ? c.desi.toFixed(2) : '—'}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )

  const renderPodTable = (rows: CargoListItem[]) => (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={40}>
            <Checkbox aria-label="Tümünü seç" />
          </Table.Th>
          <Table.Th>Taşıyıcı Barkod</Table.Th>
          <Table.Th>Referans Barkod</Table.Th>
          <Table.Th>Sipariş Numarası</Table.Th>
          <Table.Th>Alıcı</Table.Th>
          <Table.Th>Alıcı Tel</Table.Th>
          <Table.Th>Tahmini K.Ö Mahsup Tarihi</Table.Th>
          <Table.Th>Ödeme Türü</Table.Th>
          <Table.Th>Ödeme Durumu</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((c) => (
          <Table.Tr key={c.id}>
            <Table.Td>
              <Checkbox aria-label="Satır seç" />
            </Table.Td>
            <Table.Td>{c.carrier_barcode ?? '—'}</Table.Td>
            <Table.Td>{c.reference_barcode ?? '—'}</Table.Td>
            <Table.Td>{c.order_number ?? '—'}</Table.Td>
            <Table.Td>
              <Text size="sm">{c.receiver_name}</Text>
            </Table.Td>
            <Table.Td>{c.receiver_phone ?? '—'}</Table.Td>
            <Table.Td>
              {c.pod_settlement_estimate
                ? formatDateTime(c.pod_settlement_estimate)
                : 'Belli Değil'}
            </Table.Td>
            <Table.Td>{c.payment_type ?? 'Belli Değil'}</Table.Td>
            <Table.Td>
              <Badge color="yellow" variant="light">
                {c.payment_status ?? '—'}
              </Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Kargolarım</Title>
        <AccountFinanceBadges accountId={selectedAccountId} />
      </Group>

      <Tabs
        value={tab}
        onChange={(v) => {
          setTab((v as CargoListTab) ?? 'all')
          setPage(1)
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="all">Tümü</Tabs.Tab>
          <Tabs.Tab value="pod">Kapıda Ödemeli</Tabs.Tab>
          <Tabs.Tab value="draft">Taslaklar</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box>
        <ListToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          onRefresh={() => void refetch()}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {filterChips.length > 0 && (
          <Group gap="xs" mb="md">
            {filterChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="light"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (chip.key === 'pod') setFilters((f) => ({ ...f, pay_on_delivery: undefined }))
                  if (chip.key === 'movements')
                    setFilters((f) => ({ ...f, last_movements: undefined }))
                  if (chip.key === 'created')
                    setFilters((f) => ({
                      ...f,
                      created_from: undefined,
                      created_to: undefined,
                    }))
                }}
              >
                {chip.label} ×
              </Badge>
            ))}
          </Group>
        )}

        {isLoading && (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        )}

        {isError && (
          <Text c="dimmed" ta="center" py="xl">
            Kargo listesi yüklenemedi.
          </Text>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            Kayıt bulunamadı.
          </Text>
        )}

        {items.length > 0 && (
          <ScrollArea.Autosize mah={520} type="auto">
            {tab === 'pod' ? renderPodTable(items) : renderAllTable(items)}
          </ScrollArea.Autosize>
        )}

        <Group justify="space-between" mt="md" wrap="wrap">
          <Text size="sm" c="dimmed">
            {(page - 1) * Number(perPage) + 1} - {Math.min(page * Number(perPage), total)} /{' '}
            {total}
          </Text>
          <Group gap="md">
            <Group gap={6}>
              <Text size="sm" c="dimmed">
                Sayfa başına kayıt:
              </Text>
              <Select
                size="sm"
                w={72}
                data={['10', '25', '50']}
                value={perPage}
                onChange={(v) => {
                  setPerPage(v ?? '10')
                  setPage(1)
                }}
              />
            </Group>
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        </Group>
      </Box>

      <CargoFiltersDrawer
        opened={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={(f) => {
          setFilters(f)
          setPage(1)
        }}
      />
    </Stack>
  )
}
