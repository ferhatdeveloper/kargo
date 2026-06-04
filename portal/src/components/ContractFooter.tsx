import { Anchor, Group, Text } from '@mantine/core'

const contracts = [
  { label: 'Mesafeli Satış Sözleşmesi', url: '#' },
  { label: 'Gizlilik Politikası', url: '#' },
  { label: 'İptal, İade ve Değişim Koşulları', url: '#' },
]

export function ContractFooter() {
  return (
    <Group justify="center" align="center" mx="xl" p="xl" gap="lg" wrap="wrap">
      {contracts.map((c) => (
        <Anchor key={c.label} href={c.url} c="dimmed" size="sm">
          <Text size="sm" c="dimmed">
            {c.label}
          </Text>
        </Anchor>
      ))}
    </Group>
  )
}
