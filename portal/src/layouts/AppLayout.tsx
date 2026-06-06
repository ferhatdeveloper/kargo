import { useState } from 'react'
import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Loader,
  Menu,
  Select,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { AppNavbar } from '@/components/AppNavbar'
import { AccountFinanceBadges } from '@/components/layout/AccountFinanceBadges'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'

export function AppLayout() {
  const [mobileOpened, setMobileOpened] = useState(false)
  const { user, accounts, selectedAccountId, setSelectedAccountId, logout, isLoading, isAuthenticated } =
    useAuth()
  const navigate = useNavigate()
  const { t } = useLocale()

  if (isLoading) {
    return (
      <Group justify="center" mih="100vh">
        <Loader />
      </Group>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.account_code})`,
  }))

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  const dashboardPath = selectedAccountId
    ? `/accounts/${selectedAccountId}/dashboard`
    : '/'

  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      header={{ height: 56 }}
      padding="md"
    >
      <AppShell.Navbar>
        <AppNavbar onClose={() => setMobileOpened(false)} />
      </AppShell.Navbar>

      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={mobileOpened}
              onClick={() => setMobileOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            {accounts.length > 1 && (
              <Select
                data={accountOptions}
                value={selectedAccountId}
                onChange={(v) => v && setSelectedAccountId(v)}
                w={240}
                size="sm"
              />
            )}
          </Group>
          <Group gap="md" wrap="nowrap">
            <AccountFinanceBadges accountId={selectedAccountId} />
            <LocaleSwitcher />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar radius="xl" size="sm" color="blue">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {user?.first_name} {user?.last_name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user?.email}
                    </Text>
                  </div>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => navigate(dashboardPath)}>{t('app.myDashboard')}</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                {t('app.logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
