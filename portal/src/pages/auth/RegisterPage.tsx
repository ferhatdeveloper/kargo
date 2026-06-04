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
import { useLocale } from '@/context/LocaleContext'
import formClasses from './authForm.module.css'

export function RegisterPage() {
  const { t } = useLocale()
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
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 6 ? null : 'Min 6 characters'),
      password_confirmation: (v, values) =>
        v === values.password ? null : 'Passwords do not match',
    },
  })

  const handleSubmit = form.onSubmit(() => {
    notifications.show({
      color: 'blue',
      title: t('auth.register'),
      message:
        'Kayıt işlemi canlı API üzerinden yapılır. Yerel geliştirmede kayıt uç noktası yapılandırılmalıdır.',
    })
  })

  return (
    <div className={formClasses.wrapper} style={{ maxWidth: '28rem' }}>
      <div className={formClasses.mobileLogo}>
        <Logo h={40} />
      </div>

      <header className={formClasses.header}>
        <h1 className={formClasses.title}>{t('auth.registerTitle')}</h1>
        <p className={formClasses.subtitle}>{t('auth.registerSubtitle')}</p>
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
            <TextInput label={t('auth.email')} type="email" required {...form.getInputProps('email')} />
            <TextInput label="Telefon" required {...form.getInputProps('phone')} />
            <PasswordInput label={t('auth.password')} required {...form.getInputProps('password')} />
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
              {t('auth.register')}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text className={formClasses.footerHint}>
        {t('auth.hasAccount')}{' '}
        <Anchor component={Link} to="/auth/login" fw={600}>
          {t('auth.login')}
        </Anchor>
      </Text>
    </div>
  )
}
