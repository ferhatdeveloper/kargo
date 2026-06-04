import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useAuth } from '@/hooks/useAuth'

const permissionOptions = [
  'Yurtiçi',
  'Yurtdışı',
  'Fatura',
  'Kapıda Ödeme',
  'Gecikmeli Kapıda Ödeme',
  'Kapıda Ödeme (Kredi Kartı)',
  'Mahsuplaşma',
  'Alıcı Ödemeli',
  'Kapıda Alıcı Ödemeli',
  'Toplu Kargo Oluşturma',
  'Sipariş Numarası',
  'Alt Hesaplar',
]

export function SettingsPage() {
  const { accounts, selectedAccountId, user } = useAuth()
  const account = accounts.find((a) => a.id === selectedAccountId)

  return (
    <Stack gap="lg">
      <Title order={2} className="stocado-page-title">
        Ayarlar
      </Title>

      <Tabs defaultValue="account">
        <Tabs.List style={{ flexWrap: 'wrap' }}>
          <Tabs.Tab value="docs">Belge Yükle</Tabs.Tab>
          <Tabs.Tab value="account">Hesap Bilgileri</Tabs.Tab>
          <Tabs.Tab value="users">Kullanıcılar</Tabs.Tab>
          <Tabs.Tab value="addresses">Adresler</Tabs.Tab>
          <Tabs.Tab value="label">Etiket</Tabs.Tab>
          <Tabs.Tab value="login-history">Giriş Geçmişi</Tabs.Tab>
          <Tabs.Tab value="email">E-posta Bildirimleri</Tabs.Tab>
          <Tabs.Tab value="invoice">Fatura Ayarları</Tabs.Tab>
          <Tabs.Tab value="carriers">Kargo Firma Ayarları</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="account" pt="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder padding="lg">
                <Title order={4} mb="md">
                  Fatura Bilgileri
                </Title>
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Hesap Türü"
                      defaultValue="seller"
                      data={[{ value: 'seller', label: 'Satıcı Şirketi' }]}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Unvan" defaultValue={account?.name ?? ''} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="TC Kimlik No" />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Mersis No" />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Kep Adresi" />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Ticaret Sicil No" />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Select label="Grup" placeholder="Lütfen Seçiniz" data={[]} />
                  </Grid.Col>
                </Grid>

                <Title order={5} mt="xl" mb="sm">
                  Fatura Adresi
                </Title>
                <Grid>
                  <Grid.Col span={4}>
                    <TextInput label="Ülke" defaultValue="Türkiye" />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="Şehir" />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput label="İlçe" />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput label="E-posta" defaultValue={user?.email ?? ''} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea label="Adres" minRows={2} />
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder padding="lg" mb="md">
                <Title order={5} mb="sm">
                  Hesap Bilgileri
                </Title>
                <Text size="sm">
                  <strong>ID:</strong> {account?.id ?? '—'}
                </Text>
                <Text size="sm" mt={4}>
                  <strong>Hesap Adı:</strong> {account?.name}
                </Text>
                <Text size="sm" mt={4}>
                  <strong>EFT Kodu:</strong> {account?.eft_code ?? '—'}
                </Text>
                <Text size="sm" mt={4}>
                  <strong>Hesap Durumu:</strong> Aktif
                </Text>
              </Card>

              <Card withBorder padding="lg" mb="md">
                <Title order={5} mb="sm">
                  Hesap Logosu
                </Title>
                <Group>
                  <Avatar size="lg" radius="md">
                    {account?.name?.[0]}
                  </Avatar>
                  <Button variant="light" size="sm">
                    Fotoğraf seçin
                  </Button>
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Title order={5} mb="sm">
                  Hesap Yetkileri
                </Title>
                <Stack gap="xs">
                  {permissionOptions.map((label) => (
                    <Checkbox
                      key={label}
                      label={label}
                      defaultChecked={[
                        'Yurtiçi',
                        'Yurtdışı',
                        'Fatura',
                        'Kapıda Ödeme',
                        'Kapıda Ödeme (Kredi Kartı)',
                      ].includes(label)}
                    />
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="carriers" pt="lg">
          <Card withBorder padding="lg">
            <Text c="dimmed">Taşıyıcı öncelik ve varsayılan firma ayarları.</Text>
          </Card>
        </Tabs.Panel>

        {['docs', 'users', 'addresses', 'label', 'login-history', 'email', 'invoice'].map(
          (tab) => (
            <Tabs.Panel key={tab} value={tab} pt="lg">
              <Card withBorder padding="xl">
                <Text c="dimmed">Bu sekme Stocado ayarlar yapısına uyumludur; içerik yakında.</Text>
              </Card>
            </Tabs.Panel>
          ),
        )}
      </Tabs>
    </Stack>
  )
}
