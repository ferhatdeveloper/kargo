import { Image, useMantineColorScheme } from '@mantine/core'

interface LogoProps {
  h?: number
  w?: number | string
  className?: string
}

export function Logo({ h = 50, w = 'auto', className }: LogoProps) {
  const { colorScheme } = useMantineColorScheme()
  const src = colorScheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'
  return <Image src={src} alt="Kargom Kapında" h={h} w={w} fit="contain" className={className} />
}
