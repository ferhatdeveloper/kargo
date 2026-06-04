import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { theme } from './theme'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const colorSchemeManager = localStorageColorSchemeManager({ key: 'navlun-color-scheme' })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="light">
        <Notifications position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}
