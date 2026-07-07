import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/charts/styles.css'
import './styles/global.css'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { theme } from './theme'
import { AuthProvider } from './context/AuthProvider'
import { LocaleProvider } from './context/LocaleProvider'
import { AppRoutes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const colorSchemeManager = localStorageColorSchemeManager({ key: 'kargomkapinda-color-scheme' })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="light" forceColorScheme="light">
        <Notifications position="top-right" />
        <BrowserRouter>
          <LocaleProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </LocaleProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}
