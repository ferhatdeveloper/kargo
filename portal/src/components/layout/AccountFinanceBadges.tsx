import { Badge, Group, Skeleton } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { fetchFinanceSummary } from '@/api/account'
import { formatMoneyTry } from '@/lib/format'

interface AccountFinanceBadgesProps {
  accountId: string | null
}

export function AccountFinanceBadges({ accountId }: AccountFinanceBadgesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-summary', accountId],
    queryFn: () => fetchFinanceSummary(accountId!),
    enabled: !!accountId,
  })

  if (!accountId) return null

  if (isLoading) {
    return (
      <Group gap="xs">
        <Skeleton height={28} width={140} radius="xl" />
        <Skeleton height={28} width={160} radius="xl" />
      </Group>
    )
  }

  return (
    <Group gap="xs">
      <Badge size="lg" radius="sm" color="orange" variant="filled">
        Bakiye: {formatMoneyTry(data?.balance)}
      </Badge>
      <Badge size="lg" radius="sm" color="blue" variant="filled">
        K.Ö Alacak {formatMoneyTry(data?.pod_receivable)}
      </Badge>
    </Group>
  )
}
