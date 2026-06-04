import { Center, Group, Stack } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { ContractFooter } from '@/components/ContractFooter'
import { ThemeToggleButton } from '@/components/ThemeToggleButton'

export function AuthLayout() {
  return (
    <Stack mih="100vh" gap={0}>
      <Group justify="end" p="md">
        <ThemeToggleButton />
      </Group>
      <Center flex={1}>
        <Outlet />
      </Center>
      <ContractFooter />
    </Stack>
  )
}
