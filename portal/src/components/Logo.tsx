import { Image, useMantineColorScheme } from '@mantine/core'

interface LogoProps {
  h?: number
  w?: number | string
}

export function Logo({ h = 50, w = 'auto' }: LogoProps) {
  const { colorScheme } = useMantineColorScheme()
  const src = colorScheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'
  return <Image src={src} alt="Stocado" h={h} w={w} fit="contain" />
}
