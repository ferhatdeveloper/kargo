import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core'
import {
  IconChevronDown,
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { getAccountMenu, type MenuItem } from '@/config/menu'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import classes from './AppNavbar.module.css'

interface AppNavbarProps {
  onClose?: () => void
}

function MenuLink({
  labelKey,
  icon: Icon,
  path,
  children,
}: MenuItem) {
  const { t } = useLocale()
  const location = useLocation()
  const label = t(labelKey)
  const active = location.pathname === path || location.pathname.startsWith(path + '/')
  const [opened, setOpened] = useState(active)

  if (children?.length) {
    return (
      <>
        <NavLink
          label={label}
          leftSection={<Icon size={20} stroke={1.5} />}
          active={active}
          opened={opened}
          onChange={setOpened}
          rightSection={opened ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        />
        <Collapse expanded={opened}>
          <Stack gap={0} pl="md">
            {children.map((c) => (
              <NavLink
                key={c.path}
                component={Link}
                to={c.path}
                label={t(c.labelKey)}
                active={location.pathname === c.path}
              />
            ))}
          </Stack>
        </Collapse>
      </>
    )
  }

  return (
    <NavLink
      component={Link}
      to={path}
      label={label}
      leftSection={<Icon size={20} stroke={1.5} />}
      active={active}
    />
  )
}

export function AppNavbar({ onClose }: AppNavbarProps) {
  const { selectedAccountId, accounts } = useAuth()
  const account = accounts.find((a) => a.id === selectedAccountId)
  const menu = selectedAccountId ? getAccountMenu(selectedAccountId, account) : []

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between" px="md" h={59} align="center">
          <Logo h={50} />
          {onClose && (
            <ActionIcon onClick={onClose} variant="transparent" size={40} color="dark">
              <IconLayoutSidebarLeftCollapse size={22} />
            </ActionIcon>
          )}
        </Group>
      </div>
      <ScrollArea className={classes.links}>
        <Box py="md">
          {account && (
            <Text size="xs" c="dimmed" px="md" mb="sm" tt="uppercase" fw={600}>
              {account.name}
            </Text>
          )}
          {menu.map((item) => (
            <MenuLink key={item.path} {...item} />
          ))}
        </Box>
      </ScrollArea>
    </nav>
  )
}
