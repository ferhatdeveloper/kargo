import { Anchor, Box, Button, Paper, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'E-posta adresi geçerli değil'),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await forgotPassword(values.email)
      notifications.show({
        color: 'green',
        title: 'E-posta gönderildi',
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      })
      navigate('/tr/auth/login')
    } catch {
      notifications.show({
        color: 'red',
        title: 'Hata',
        message: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
      })
    }
  })

  return (
    <Box>
      <Title ta="center">Şifrenizi mi unuttunuz?</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        E-posta adresinizi girin, size şifrenizi sıfırlamak için bir bağlantı göndereceğiz.
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" miw={400} maw="90%">
        <form onSubmit={handleSubmit}>
          <TextInput label="E-posta" placeholder="E-posta" required {...form.getInputProps('email')} />
          <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
            Sıfırlama bağlantısı gönder
          </Button>
          <Anchor component={Link} to="/tr/auth/login" size="sm" display="block" ta="center" mt="md">
            Giriş sayfasına dön
          </Anchor>
        </form>
      </Paper>
    </Box>
  )
}
