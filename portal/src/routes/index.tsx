import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CargosPage } from '@/pages/cargos/CargosPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { useAuth } from '@/hooks/useAuth'
import { LegacyLocaleRedirect } from './LegacyLocaleRedirect'

function HomeRedirect() {
  const { selectedAccountId, accounts, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />

  const accountId = selectedAccountId ?? accounts[0]?.id ?? null
  if (accountId) {
    return <Navigate to={`/accounts/${accountId}/dashboard`} replace />
  }
  return <Navigate to="/auth/login" replace />
}

function accountRoutes() {
  const pages: { path: string; title: string }[] = [
    { path: 'dashboard', title: 'Gösterge Panelim' },
    { path: 'cargos/create', title: 'Yeni Kargo Oluştur' },
    { path: 'cargos', title: 'Kargolarım' },
    { path: 'returns', title: 'İade Yönetimi' },
    { path: 'products', title: 'Ürünlerim' },
    { path: 'pricing-plans', title: 'Fiyat Listesi' },
    { path: 'accounting-transactions', title: 'Finans Hareketlerim' },
    { path: 'pay-on-delivery', title: 'Kapıda Ödeme' },
    { path: 'invoices', title: 'Faturalarım' },
    { path: 'invoices/pending', title: 'Fatura Bekleyen Gönderiler' },
    { path: 'invoices/issued', title: 'Kestiğim Faturalar' },
    { path: 'invoices/external', title: 'Harici Kesilen Faturalar' },
    { path: 'settings/invoice-settings', title: 'Fatura Ayarları' },
    { path: 'market-orders', title: 'Pazaryeri Siparişleri' },
    { path: 'integrations', title: 'Entegrasyonlar' },
    { path: 'sub-accounts', title: 'Alt Hesaplar' },
    { path: 'statistics', title: 'İstatistikler' },
    { path: 'tickets', title: 'Destek Merkezi' },
    { path: 'settings', title: 'Ayarlar' },
  ]

  return pages.map(({ path, title }) => {
    if (path === 'dashboard') {
      return <Route key={path} path="dashboard" element={<DashboardPage />} />
    }
    if (path === 'cargos') {
      return <Route key={path} path="cargos" element={<CargosPage />} />
    }
    return (
      <Route
        key={path}
        path={path}
        element={<PlaceholderPage title={title} />}
      />
    )
  })
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="accounts/:accountId">{accountRoutes()}</Route>
      </Route>

      <Route path="/tr/*" element={<LegacyLocaleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
