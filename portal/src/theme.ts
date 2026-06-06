import { createTheme } from '@mantine/core'

/** Stocado portal görsel dili (https://portal.stocado.com) */
export const STOCADO_BLUE = '#0d87f7'
export const STOCADO_BLUE_HOVER = '#0b6fd6'
export const STOCADO_ORANGE = '#ff8800'
export const STOCADO_SIDEBAR_ACTIVE_BG = '#e6f4ff'

export const theme = createTheme({
  primaryColor: 'stocado',
  defaultRadius: 'sm',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontSizes: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.5',
    lg: '1.55',
    xl: '1.6',
  },
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  colors: {
    stocado: [
      '#e6f4ff',
      '#b3e0ff',
      '#80ccff',
      '#4db8ff',
      '#1aa4ff',
      '#0d87f7',
      '#0b6fd6',
      '#0957b5',
      '#073f94',
      '#052773',
    ],
    balance: [
      '#fff8e6',
      '#ffecb3',
      '#ffe080',
      '#ffd34d',
      '#ffc61a',
      '#ff8800',
      '#f57c00',
      '#e65100',
      '#bf360c',
      '#9e2000',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'sm' },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    TextInput: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    PasswordInput: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    Select: {
      defaultProps: { radius: 'sm' },
    },
    NumberInput: {
      defaultProps: { radius: 'sm' },
    },
    Paper: {
      defaultProps: { radius: 'sm' },
    },
    Card: {
      defaultProps: { radius: 'sm' },
    },
    Badge: {
      defaultProps: { radius: 'sm' },
    },
    Tabs: {
      defaultProps: { variant: 'pills' },
      styles: {
        tab: {
          fontWeight: 500,
          '&[data-active]': {
            backgroundColor: STOCADO_BLUE,
            color: '#fff',
          },
        },
      },
    },
    Table: {
      styles: {
        th: {
          fontSize: '13px',
          fontWeight: 600,
          color: '#374151',
          backgroundColor: '#f9fafb',
          padding: '10px 12px',
          borderBottom: '1px solid #e5e7eb',
        },
        td: {
          fontSize: '13px',
          padding: '10px 12px',
          borderBottom: '1px solid #f3f4f6',
        },
        tr: {
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 0,
          fontWeight: 500,
          color: '#4b5563',
          padding: '10px 14px',
          margin: 0,
          '&[data-active]': {
            backgroundColor: STOCADO_SIDEBAR_ACTIVE_BG,
            color: STOCADO_BLUE,
            fontWeight: 600,
            borderLeft: `3px solid ${STOCADO_BLUE}`,
            paddingLeft: '11px',
          },
          '&:hover:not([data-active])': {
            backgroundColor: '#f3f4f6',
          },
        },
        label: {
          fontSize: '14px',
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor: '#f5f7fa',
        },
        header: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        },
        navbar: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
  },
})
