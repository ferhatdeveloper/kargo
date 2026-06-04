import { Badge, Group, Skeleton } from '@mantine/core'
import { IconCurrencyLira, IconWallet } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { fetchFinanceSummary } from '@/api/account'
import { STOCADO_BLUE, STOCADO_ORANGE } from '@/theme'
import { formatMoneyTry } from '@/lib/format'

interface AccountFinanceBadgesProps {
  accountId: string | null
}

const badgeStyles = (bg: string) => ({
  root: {
    backgroundColor: bg,
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '13px',
    padding: '6px 12px',
    height: 'auto',
    textTransform: 'none' as const,
  },
})

export function AccountFinanceBadges({ accountId }: AccountFinanceBadgesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-summary', accountId],
    queryFn: () => fetchFinanceSummary(accountId!),
    enabled: !!accountId,
  })

  if (!accountId) return null

  if (isLoading) {
    return (
      <Group gap={6}>
        <Skeleton height={32} width={130} radius="sm" />
        <Skeleton height={32} width={150} radius="sm" />
      </Group>
    )
  }

  return (
    <Group gap={6} wrap="nowrap">
      <Badge
        size="lg"
        radius="sm"
        leftSection={<IconWallet size={15} stroke={2} />}
        styles={badgeStyles(STOCADO_ORANGE)}
      >
        Bakiye {formatMoneyTry(data?.balance)}
      </Badge>
      <Badge
        size="lg"
        radius="sm"
        leftSection={<IconCurrencyLira size={15} stroke={2} />}
        styles={badgeStyles(STOCADO_BLUE)}
      >
        K.Ö Alacak {formatMoneyTry(data?.pod_receivable)}
      </Badge>
    </Group>
  )
}
