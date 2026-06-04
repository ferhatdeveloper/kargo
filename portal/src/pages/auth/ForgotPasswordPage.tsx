import { Anchor, Button, Paper, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'
import { useLocale } from '@/context/LocaleContext'
import formClasses from './authForm.module.css'

export function ForgotPasswordPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await forgotPassword(values.email)
      notifications.show({
        color: 'green',
        title: t('auth.email'),
        message: t('auth.forgotSubtitle'),
      })
      navigate('/auth/login')
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Request failed',
      })
    }
  })

  return (
    <div className={formClasses.wrapper}>
      <header className={formClasses.header}>
        <Title order={2} className={formClasses.title}>
          {t('auth.forgotTitle')}
        </Title>
        <Text className={formClasses.subtitle}>{t('auth.forgotSubtitle')}</Text>
      </header>
      <Paper className={formClasses.card} radius="lg">
        <form onSubmit={handleSubmit}>
          <TextInput
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            required
            {...form.getInputProps('email')}
          />
          <Button type="submit" fullWidth mt="xl" loading={form.submitting} className={formClasses.primaryButton}>
            {t('auth.forgot')}
          </Button>
          <Anchor component={Link} to="/auth/login" size="sm" display="block" ta="center" mt="md">
            {t('auth.backToLogin')}
          </Anchor>
        </form>
      </Paper>
    </div>
  )
}
