import { createTheme } from '@mantine/core'

/** Navlun marka: lacivert #203D75, kırmızı #C42126 */
export const theme = createTheme({
  primaryColor: 'navlun',
  colors: {
    navlun: [
      '#e8edf5',
      '#c5d0e6',
      '#9fb3d6',
      '#7896c7',
      '#5279b8',
      '#355fa9',
      '#284d8f',
      '#203d75',
      '#1a335f',
      '#142949',
    ],
  },
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    fontWeight: '600',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
  },
})
