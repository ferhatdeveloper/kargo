import { ActionIcon, Button, Group, TextInput } from '@mantine/core'
import {
  IconChartBar,
  IconDownload,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconTable,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface ListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onRefresh?: () => void
  onOpenFilters?: () => void
  extra?: ReactNode
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Ara...',
  onRefresh,
  onOpenFilters,
  extra,
}: ListToolbarProps) {
  return (
    <Group justify="space-between" wrap="wrap" mb="md">
      <TextInput
        placeholder={searchPlaceholder}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        w={{ base: '100%', sm: 280 }}
      />
      <Group gap="xs">
        {extra}
        <ActionIcon variant="light" size="lg" aria-label="Grafik">
          <IconChartBar size={18} />
        </ActionIcon>
        <ActionIcon variant="light" size="lg" aria-label="Yenile" onClick={onRefresh}>
          <IconRefresh size={18} />
        </ActionIcon>
        <ActionIcon variant="light" size="lg" aria-label="Tablo görünümü">
          <IconTable size={18} />
        </ActionIcon>
        <ActionIcon variant="light" size="lg" aria-label="İndir">
          <IconDownload size={18} />
        </ActionIcon>
        {onOpenFilters && (
          <Button leftSection={<IconFilter size={16} />} onClick={onOpenFilters}>
            Filtreler
          </Button>
        )}
      </Group>
    </Group>
  )
}
