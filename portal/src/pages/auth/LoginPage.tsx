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
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

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
        message: 'E-posta veya şifre hatalı.',
      })
    }
  })

  return (
    <Stack gap={0} align="center">
      <Title ta="center">Tekrar hoş geldiniz!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Henüz bir hesabınız yok mu?{' '}
        <Anchor size="sm" component={Link} to="/tr/auth/register">
          Kayıt Ol
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" w={375} maw="90%">
        <form onSubmit={handleSubmit}>
          <TextInput
            autoFocus
            type="email"
            label="E-posta"
            placeholder="E-posta"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Şifre"
            placeholder="Şifreniz"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Beni hatırla" {...form.getInputProps('remember', { type: 'checkbox' })} />
            <Anchor component={Link} to="/tr/auth/forgot-password" size="sm">
              Şifremi unuttum
            </Anchor>
          </Group>
          <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
            Giriş yap
          </Button>
        </form>
      </Paper>
    </Stack>
  )
}
