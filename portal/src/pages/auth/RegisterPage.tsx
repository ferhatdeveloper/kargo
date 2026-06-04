import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Link } from 'react-router-dom'

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
    <Stack gap={0} align="center">
      <Title ta="center">Hesap oluşturun</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Zaten hesabınız var mı?{' '}
        <Anchor size="sm" component={Link} to="/tr/auth/login">
          Giriş yap
        </Anchor>
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" w={420} maw="95%">
        <form onSubmit={handleSubmit}>
          <TextInput label="Ad" required {...form.getInputProps('first_name')} />
          <TextInput label="Soyad" required mt="md" {...form.getInputProps('last_name')} />
          <TextInput label="E-posta" type="email" required mt="md" {...form.getInputProps('email')} />
          <TextInput label="Telefon" required mt="md" {...form.getInputProps('phone')} />
          <PasswordInput label="Şifre" required mt="md" {...form.getInputProps('password')} />
          <PasswordInput
            label="Şifre Tekrar"
            required
            mt="md"
            {...form.getInputProps('password_confirmation')}
          />
          <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
            Kayıt Ol
          </Button>
        </form>
      </Paper>
    </Stack>
  )
}
