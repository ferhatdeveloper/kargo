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
import { isPostgrest } from '@/api/config'
import { getApiErrorMessage } from '@/api/errors'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import formClasses from './authForm.module.css'
import classes from './LoginPage.module.css'

export function LoginPage() {
  const { t } = useLocale()
  const { login } = useAuth()
  const navigate = useNavigate()
  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : t('auth.emailInvalid')),
      password: (v) => (v.trim().length >= 6 ? null : t('auth.passwordMin')),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const accountId = await login(values.email, values.password, values.remember)
      if (accountId) {
        navigate(`/accounts/${accountId}/dashboard`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        title: t('auth.loginFailed'),
        message: getApiErrorMessage(error, t('auth.loginFailedMessage')),
      })
    }
  })

  return (
    <div className={formClasses.wrapper}>
      <header className={formClasses.header}>
        <h1 className={formClasses.title}>{t('auth.welcome')}</h1>
      </header>

      <Text className={formClasses.registerRow}>
        {t('auth.registerPrompt')}{' '}
        <Anchor component={Link} to="/auth/register" fw={600} c="#0d87f7">
          {t('auth.register')}
        </Anchor>
      </Text>

      {import.meta.env.DEV && isPostgrest && (
        <Text size="xs" c="dimmed" mb="md" ta="center">
          {t('auth.localHint', {
            email1: 'demo@navlun.local',
            email2: 'demo@stocado.local',
            password: 'Demo123!',
          })}
        </Text>
      )}

      <Paper className={formClasses.card} radius="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              autoFocus
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              required
              leftSection={<IconMail size={18} stroke={1.5} />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              required
              leftSection={<IconLock size={18} stroke={1.5} />}
              {...form.getInputProps('password')}
            />
            <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
              <Checkbox
                label={t('auth.remember')}
                size="sm"
                {...form.getInputProps('remember', { type: 'checkbox' })}
              />
              <Anchor component={Link} to="/auth/forgot-password" size="sm" fw={500}>
                {t('auth.forgot')}
              </Anchor>
            </Group>
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={form.submitting}
              className={`${formClasses.primaryButton} ${classes.submitButton}`}
            >
              {t('auth.login')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  )
}
