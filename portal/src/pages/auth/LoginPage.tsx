import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconLock, IconMail } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import formClasses from './authForm.module.css'
import classes from './LoginPage.module.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-posta adresi geçerli değil'),
      password: (v) => (v.trim().length >= 6 ? null : 'Şifre en az 6 karakter olmalıdır'),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login(values.email, values.password, values.remember)
      navigate('/tr')
    } catch {
      notifications.show({
        color: 'red',
        title: 'Giriş başarısız',
        message: 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
      })
    }
  })

  return (
    <div className={formClasses.wrapper}>
      <div className={formClasses.mobileLogo}>
        <Logo h={40} />
      </div>

      <header className={formClasses.header}>
        <h1 className={formClasses.title}>Tekrar hoş geldiniz</h1>
        <p className={formClasses.subtitle}>
          Hesabınıza giriş yaparak kargo panelinize erişin.
        </p>
      </header>

      <Paper className={formClasses.card} radius="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              autoFocus
              type="email"
              label="E-posta"
              placeholder="ornek@firma.com"
              required
              leftSection={<IconMail size={18} stroke={1.5} />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              required
              leftSection={<IconLock size={18} stroke={1.5} />}
              {...form.getInputProps('password')}
            />
            <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
              <Checkbox
                label="Beni hatırla"
                size="sm"
                {...form.getInputProps('remember', { type: 'checkbox' })}
              />
              <Anchor component={Link} to="/tr/auth/forgot-password" size="sm" fw={500}>
                Şifremi unuttum
              </Anchor>
            </Group>
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={form.submitting}
              className={`${formClasses.primaryButton} ${classes.submitButton}`}
            >
              Giriş yap
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text className={formClasses.footerHint}>
        Henüz bir hesabınız yok mu?{' '}
        <Anchor component={Link} to="/tr/auth/register" fw={600}>
          Kayıt Ol
        </Anchor>
      </Text>
    </div>
  )
}
