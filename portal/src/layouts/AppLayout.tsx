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
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const [mobileOpened, setMobileOpened] = useState(false)
  const { user, accounts, selectedAccountId, setSelectedAccountId, logout, isLoading, isAuthenticated } =
    useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Group justify="center" mih="100vh">
        <Loader />
      </Group>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/tr/auth/login" replace />
  }

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.account_code})`,
  }))

  const handleLogout = async () => {
    await logout()
    navigate('/tr/auth/login')
  }

  const dashboardPath = selectedAccountId
    ? `/tr/accounts/${selectedAccountId}/dashboard`
    : '/tr'

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Navbar>
        <AppNavbar onClose={() => setMobileOpened(false)} />
      </AppShell.Navbar>

      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
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
                w={280}
                size="sm"
              />
            )}
          </Group>
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
              <Menu.Item onClick={() => navigate(dashboardPath)}>Gösterge Panelim</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Çıkış Yap
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
