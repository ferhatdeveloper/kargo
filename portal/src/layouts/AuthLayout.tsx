import { Box, Group, Text } from '@mantine/core'
import {
  IconChartBar,
  IconPackage,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { Outlet } from 'react-router-dom'
import { ContractFooter } from '@/components/ContractFooter'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Logo } from '@/components/Logo'
import { ThemeToggleButton } from '@/components/ThemeToggleButton'
import { useLocale } from '@/context/LocaleContext'
import type { MessageKey } from '@/i18n/messages'
import heroImage from '@/assets/hero.png'
import classes from './AuthLayout.module.css'

const featureDefs: {
  icon: typeof IconTruckDelivery
  titleKey: MessageKey
  descKey: MessageKey
}[] = [
  { icon: IconTruckDelivery, titleKey: 'brand.f1.title', descKey: 'brand.f1.desc' },
  { icon: IconPackage, titleKey: 'brand.f2.title', descKey: 'brand.f2.desc' },
  { icon: IconChartBar, titleKey: 'brand.f3.title', descKey: 'brand.f3.desc' },
]

export function AuthLayout() {
  const { t } = useLocale()

  return (
    <Box className={classes.root}>
      <Box className={classes.brandPanel} component="aside" aria-hidden={false}>
        <div className={classes.brandInner}>
          <Logo h={44} w="auto" className={classes.brandLogo} />
          <h1 className={classes.brandTitle}>{t('brand.tagline')}</h1>
          <p className={classes.brandLead}>{t('brand.lead')}</p>
          <ul className={classes.features}>
            {featureDefs.map(({ icon: Icon, titleKey, descKey }) => (
              <li key={titleKey} className={classes.featureItem}>
                <span className={classes.featureIcon}>
                  <Icon size={20} stroke={1.6} />
                </span>
                <span>
                  <Text component="span" fw={600} display="block" size="sm">
                    {t(titleKey)}
                  </Text>
                  <Text component="span" size="sm" opacity={0.85}>
                    {t(descKey)}
                  </Text>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={classes.heroWrap}>
          <img src={heroImage} alt="" className={classes.heroImage} loading="lazy" />
        </div>
      </Box>

      <Box className={classes.formPanel} component="main">
        <div className={classes.formHeader}>
          <Group gap="sm">
            <LocaleSwitcher />
            <ThemeToggleButton />
          </Group>
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
