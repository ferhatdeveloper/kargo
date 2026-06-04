import { Box, Group } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { ContractFooter } from '@/components/ContractFooter'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Logo } from '@/components/Logo'
import classes from './AuthLayout.module.css'

/** Stocado login: ortalanmış tek kolon, beyaz arka plan */
export function AuthLayout() {
  return (
    <Box className={classes.root} pos="relative">
      <Group className={classes.topActions} gap="sm">
        <LocaleSwitcher />
      </Group>
      <Box className={classes.center}>
        <div className={classes.logoWrap}>
          <Logo h={48} />
        </div>
        <div className={classes.formBody}>
          <Outlet />
        </div>
        <div className={classes.formFooter}>
          <ContractFooter />
        </div>
      </Box>
    </Box>
  )
}
