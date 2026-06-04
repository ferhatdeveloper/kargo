import {
  Anchor,
  Button,
  Grid,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import formClasses from './authForm.module.css'

export function RegisterPage() {
  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-posta adresi geçerli değil'),
      password: (v) => (v.length >= 6 ? null : 'Şifre en az 6 karakter olmalıdır'),
      password_confirmation: (v, values) =>
        v === values.password ? null : 'Şifreler eşleşmiyor',
    },
  })

  const handleSubmit = form.onSubmit(() => {
    notifications.show({
      color: 'blue',
      title: 'Kayıt',
      message:
        'Kayıt işlemi canlı API üzerinden yapılır. Geliştirme ortamında portal.stocado.com kayıt akışını kullanın.',
    })
  })

  return (
    <div className={formClasses.wrapper} style={{ maxWidth: '28rem' }}>
      <div className={formClasses.mobileLogo}>
        <Logo h={40} />
      </div>

      <header className={formClasses.header}>
        <h1 className={formClasses.title}>Hesap oluşturun</h1>
        <p className={formClasses.subtitle}>Stocado ile kargo yönetimine hemen başlayın.</p>
      </header>

      <Paper className={formClasses.card} radius="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Ad" required {...form.getInputProps('first_name')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput label="Soyad" required {...form.getInputProps('last_name')} />
              </Grid.Col>
            </Grid>
            <TextInput label="E-posta" type="email" required {...form.getInputProps('email')} />
            <TextInput label="Telefon" required {...form.getInputProps('phone')} />
            <PasswordInput label="Şifre" required {...form.getInputProps('password')} />
            <PasswordInput
              label="Şifre Tekrar"
              required
              {...form.getInputProps('password_confirmation')}
            />
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={form.submitting}
              className={formClasses.primaryButton}
            >
              Kayıt Ol
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text className={formClasses.footerHint}>
        Zaten hesabınız var mı?{' '}
        <Anchor component={Link} to="/tr/auth/login" fw={600}>
          Giriş yap
        </Anchor>
      </Text>
    </div>
  )
}
