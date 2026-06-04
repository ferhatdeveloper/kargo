import { Box, Text } from '@mantine/core'
import {
  IconChartBar,
  IconPackage,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { Outlet } from 'react-router-dom'
import { ContractFooter } from '@/components/ContractFooter'
import { Logo } from '@/components/Logo'
import { ThemeToggleButton } from '@/components/ThemeToggleButton'
import heroImage from '@/assets/hero.png'
import classes from './AuthLayout.module.css'

const features = [
  {
    icon: IconTruckDelivery,
    title: 'Kargo operasyonları',
    description: 'Gönderilerinizi oluşturun, takip edin ve yönetin.',
  },
  {
    icon: IconPackage,
    title: 'Pazaryeri entegrasyonları',
    description: 'Siparişlerinizi tek panelden senkronize edin.',
  },
  {
    icon: IconChartBar,
    title: 'Finans ve raporlama',
    description: 'Faturalar, kapıda ödeme ve istatistikler elinizin altında.',
  },
]

export function AuthLayout() {
  return (
    <Box className={classes.root}>
      <Box className={classes.brandPanel} component="aside" aria-hidden={false}>
        <div className={classes.brandInner}>
          <Logo h={44} w="auto" className={classes.brandLogo} />
          <h1 className={classes.brandTitle}>Kargo yönetiminiz tek yerde</h1>
          <p className={classes.brandLead}>
            Navlun ile gönderilerinizi, entegrasyonlarınızı ve finansal işlemlerinizi güvenle
            yönetin.
          </p>
          <ul className={classes.features}>
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className={classes.featureItem}>
                <span className={classes.featureIcon}>
                  <Icon size={20} stroke={1.6} />
                </span>
                <span>
                  <Text component="span" fw={600} display="block" size="sm">
                    {title}
                  </Text>
                  <Text component="span" size="sm" opacity={0.85}>
                    {description}
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
          <ThemeToggleButton />
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
