import { Card, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card withBorder padding="xl" radius="md">
      <Stack gap="md">
        <GroupTitle title={title} />
        <Text c="dimmed" size="sm">
          {description ??
            'Bu sayfa Stocado portal yapısına uygun olarak hazırlandı. Canlı API ile entegre edilebilir.'}
        </Text>
      </Stack>
    </Card>
  )
}

function GroupTitle({ title }: { title: string }) {
  return (
    <Stack gap="xs">
      <ThemeIcon variant="light" size="lg" color="blue">
        <IconInfoCircle size={20} />
      </ThemeIcon>
      <Title order={2}>{title}</Title>
    </Stack>
  )
}
