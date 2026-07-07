import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import {
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Stepper,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconPrinter } from '@tabler/icons-react'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createCargo,
  fetchAddresses,
  fetchCargoQuote,
  fetchLabelSettings,
  saveLabelSettings,
} from '@/api/shipping'
import { queryProducts } from '@/api/products'
import { CarrierQuoteCompare } from '@/components/cargo/CarrierQuoteCompare'
import { LabelDesigner } from '@/components/cargo/LabelDesigner'
import { ShippingLabelPreview } from '@/components/cargo/ShippingLabelPreview'
import { useAuth } from '@/hooks/useAuth'
import { computeChargeableDesi } from '@/lib/shipping'
import type { LabelSettings } from '@/types/shipping'

const defaultLabel: LabelSettings = {
  format: '100x150',
  layout: 'standard',
  show_logo: true,
  show_barcode: true,
  show_reference: true,
  font_size: 'md',
  accent_color: '#228be6',
}

export function CreateCargoPage() {
  const { selectedAccountId, accounts } = useAuth()
  const account = accounts.find((a) => a.id === selectedAccountId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [active, setActive] = useState(0)
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null)
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(defaultLabel)
  const [previewTracking, setPreviewTracking] = useState('ONIZLEME0000001')

  const form = useForm({
    initialValues: {
      sender_key: '',
      receiver_name: '',
      receiver_phone: '',
      receiver_city: '',
      receiver_district: '',
      receiver_address: '',
      content_description: '',
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      weight_kg: 1,
      pay_on_delivery: false,
      pod_amount: 0,
      is_draft: false,
      product_id: '',
      manual_desi: 0,
      receiver_pays: false,
      controlled_delivery: false,
      shipment_mode: 'send',
    },
    validate: {
      receiver_name: (v) => (v.trim().length < 2 ? 'Alıcı adı gerekli' : null),
      receiver_city: (v) => (v.trim().length < 2 ? 'Şehir gerekli' : null),
      receiver_address: (v) => (v.trim().length < 5 ? 'Adres gerekli' : null),
    },
  })

  const [debouncedDims] = useDebouncedValue(
    {
      l: form.values.length_cm,
      w: form.values.width_cm,
      h: form.values.height_cm,
      kg: form.values.weight_kg,
      pod: form.values.pay_on_delivery,
    },
    400,
  )

  const { data: productsData } = useQuery({
    queryKey: ['products-select', selectedAccountId],
    queryFn: () => queryProducts(selectedAccountId!, 1, 50),
    enabled: !!selectedAccountId,
  })

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', selectedAccountId],
    queryFn: () => fetchAddresses(selectedAccountId!),
    enabled: !!selectedAccountId,
  })

  useEffect(() => {
    if (!selectedAccountId) return
    fetchLabelSettings(selectedAccountId).then(setLabelSettings).catch(() => {})
  }, [selectedAccountId])

  const desi = useMemo(
    () =>
      computeChargeableDesi(
        debouncedDims.l,
        debouncedDims.w,
        debouncedDims.h,
        debouncedDims.kg,
      ),
    [debouncedDims],
  )

  const { data: quoteResult, isFetching: quoteLoading } = useQuery({
    queryKey: ['cargo-quote', selectedAccountId, debouncedDims, desi],
    queryFn: () =>
      fetchCargoQuote(selectedAccountId!, {
        length_cm: debouncedDims.l,
        width_cm: debouncedDims.w,
        height_cm: debouncedDims.h,
        weight_kg: debouncedDims.kg,
        pay_on_delivery: debouncedDims.pod,
        pod_amount: form.values.pod_amount || undefined,
      }),
    enabled: !!selectedAccountId && active >= 2 && desi > 0,
  })

  const resolvedCarrierId =
    selectedCarrierId ?? quoteResult?.quotes.find((q) => q.is_cheapest)?.carrier_id ?? null

  const senderAddress = useMemo(() => {
    const found = addresses.find((a) => a.id === form.values.sender_key)
    if (found) return found
    return addresses.find((a) => a.is_default) ?? addresses[0]
  }, [addresses, form.values.sender_key])

  const selectedQuote = quoteResult?.quotes.find((q) => q.carrier_id === resolvedCarrierId)

  const labelData = useMemo(
    () => ({
      senderName: senderAddress?.contact_name ?? account?.name ?? 'Gönderici',
      senderLine: senderAddress
        ? `${senderAddress.district ?? ''} ${senderAddress.city} — ${senderAddress.address_line}`
        : '—',
      receiverName: form.values.receiver_name || 'Alıcı',
      receiverLine: `${form.values.receiver_district} ${form.values.receiver_city} — ${form.values.receiver_address}`,
      receiverPhone: form.values.receiver_phone,
      carrierTitle: selectedQuote?.title ?? 'Taşıyıcı seçin',
      trackingNumber: previewTracking,
      referenceBarcode: previewTracking.slice(-12),
      desi,
      podAmount: form.values.pay_on_delivery ? form.values.pod_amount : undefined,
      accountName: account?.name,
    }),
    [senderAddress, account, form.values, selectedQuote, previewTracking, desi],
  )

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedAccountId) throw new Error('Hesap seçili değil')
      return createCargo({
        account_id: selectedAccountId,
        carrier_id: resolvedCarrierId ?? undefined,
        receiver_name: form.values.receiver_name,
        receiver_phone: form.values.receiver_phone,
        sender: senderAddress
          ? {
              contact_name: senderAddress.contact_name,
              city: senderAddress.city,
              district: senderAddress.district,
              address_line: senderAddress.address_line,
              phone: senderAddress.phone,
            }
          : undefined,
        receiver: {
          name: form.values.receiver_name,
          phone: form.values.receiver_phone,
          city: form.values.receiver_city,
          district: form.values.receiver_district,
          address_line: form.values.receiver_address,
        },
        length_cm: form.values.length_cm,
        width_cm: form.values.width_cm,
        height_cm: form.values.height_cm,
        weight_kg: form.values.weight_kg,
        desi,
        content_description: form.values.content_description,
        pay_on_delivery: form.values.pay_on_delivery,
        pod_amount: form.values.pay_on_delivery ? form.values.pod_amount : undefined,
        is_draft: form.values.is_draft,
        label_settings: labelSettings,
      })
    },
    onSuccess: async (result) => {
      await saveLabelSettings(selectedAccountId!, labelSettings).catch(() => {})
      setPreviewTracking(result.tracking_number)
      await queryClient.invalidateQueries({ queryKey: ['cargos'] })
      notifications.show({
        title: form.values.is_draft ? 'Taslak kaydedildi' : 'Kargo oluşturuldu',
        message: `Takip no: ${result.tracking_number}`,
        color: 'green',
      })
      if (!form.values.is_draft) {
        navigate(`/accounts/${selectedAccountId}/cargos`)
      }
    },
    onError: () => {
      notifications.show({
        title: 'Kayıt başarısız',
        message: 'Kargo oluşturulamadı. Alanları kontrol edin.',
        color: 'red',
      })
    },
  })

  const nextStep = () => {
    if (active === 0) {
      const validation = form.validate()
      if (validation.hasErrors) return
      if (!form.values.receiver_city.trim() || !form.values.receiver_address.trim()) {
        notifications.show({ message: 'Alıcı adres bilgilerini doldurun', color: 'orange' })
        return
      }
    }
    if (active === 1 && desi <= 0) {
      notifications.show({ message: 'Desi veya ölçü girin', color: 'orange' })
      return
    }
    if (active === 3 && !resolvedCarrierId) {
      notifications.show({ message: 'Bir taşıyıcı seçin', color: 'orange' })
      return
    }
    setActive((c) => Math.min(c + 1, 3))
  }

  const handlePrint = () => {
    window.print()
  }

  if (!selectedAccountId) {
    return <Text c="dimmed">Lütfen bir hesap seçin.</Text>
  }

  const addressOptions = addresses.map((a) => ({
    value: a.id,
    label: `${a.label ?? a.contact_name} — ${a.city}`,
  }))

  const productOptions = (productsData?.items ?? []).map((p) => ({
    value: p.id,
    label: `${p.title} (${p.sku})`,
  }))

  const sidePanel = (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="sm">
        <Button fullWidth size="md">
          Kargo Gönder
        </Button>
        <Button fullWidth variant="default">
          Kargo Bana Gelsin
        </Button>
        <Title order={6} mt="md">
          Tekliflerim
        </Title>
        <Text size="sm" c="dimmed">
          {desi > 0 && quoteResult?.quotes.length
            ? `${quoteResult.quotes.length} taşıyıcı teklifi hazır.`
            : 'Teklifleri görmek için boyut ve ağırlık bilgilerini güncelleyin.'}
        </Text>
        {selectedQuote && (
          <Text fw={700} c="blue">
            Seçili: {selectedQuote.title} — {selectedQuote.total.toFixed(2)} ₺
          </Text>
        )}
      </Stack>
    </Card>
  )

  return (
    <Stack gap="lg" className="create-cargo-page">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Yeni Kargo Oluştur</Title>
        </div>
        <Button component={Link} to={`/accounts/${selectedAccountId}/cargos`} variant="subtle">
          Listeye dön
        </Button>
      </Group>

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
        <Stepper.Step label="Gönderici ve Alıcı" description="Adres bilgileri">
          <Card withBorder padding="lg" mt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group align="flex-end" wrap="nowrap">
                  <Select
                    style={{ flex: 1 }}
                    label="Gönderici Bilgileri"
                    placeholder="Gönderici seçin"
                    data={addressOptions}
                    value={form.values.sender_key || addressOptions[0]?.value || null}
                    onChange={(v) => form.setFieldValue('sender_key', v ?? '')}
                  />
                  <Button variant="light" px="sm">
                    +
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group align="flex-end" wrap="nowrap">
                  <Select
                    style={{ flex: 1 }}
                    label="Alıcı Bilgileri"
                    placeholder="Alıcı Adres Seçin"
                    data={[]}
                    searchable
                    clearable
                  />
                  <Button variant="light" px="sm">
                    +
                  </Button>
                </Group>
                <TextInput
                  label="Alıcı adı"
                  required
                  mt="sm"
                  {...form.getInputProps('receiver_name')}
                />
                <TextInput
                  label="Alıcı telefon"
                  mt="sm"
                  {...form.getInputProps('receiver_phone')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput label="İl" required {...form.getInputProps('receiver_city')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput label="İlçe" {...form.getInputProps('receiver_district')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Textarea
                  label="Adres"
                  required
                  minRows={2}
                  {...form.getInputProps('receiver_address')}
                />
              </Grid.Col>
            </Grid>
          </Card>
        </Stepper.Step>

        <Stepper.Step label="Paket Bilgisi" description="Ürün ve ölçü">
          <Card withBorder padding="lg" mt="md">
            <Radio.Group
              label="Kapıda Ödeme Seçeneği"
              value={form.values.pay_on_delivery ? 'pod' : 'none'}
              onChange={(v) => form.setFieldValue('pay_on_delivery', v === 'pod')}
              mb="md"
            >
              <Group mt="xs">
                <Radio value="pod" label="Kapıda Ödeme" />
              </Group>
            </Radio.Group>
            <Group align="flex-end" mb="md">
              <Select
                style={{ flex: 1 }}
                label="Paket Bilgileri"
                placeholder="Ürün Seçin"
                data={productOptions}
                value={form.values.product_id || null}
                onChange={(v) => form.setFieldValue('product_id', v ?? '')}
                searchable
              />
              <Button variant="light">+</Button>
            </Group>
            <Textarea
              label="Açıklama"
              description="Kargonun içeriği hakkında açıklama giriniz."
              mb="md"
              {...form.getInputProps('content_description')}
            />
            <NumberInput
              label="Desi (kg)"
              required
              min={0}
              decimalScale={2}
              value={form.values.manual_desi || desi}
              onChange={(v) => form.setFieldValue('manual_desi', Number(v) || 0)}
              mb="sm"
            />
            <Text size="sm" c="dimmed" mb="md" ta="center">
              ya da
            </Text>
            <Grid>
              <Grid.Col span={3}>
                <NumberInput label="En (cm)" min={0} {...form.getInputProps('length_cm')} />
              </Grid.Col>
              <Grid.Col span={3}>
                <NumberInput label="Boy (cm)" min={0} {...form.getInputProps('width_cm')} />
              </Grid.Col>
              <Grid.Col span={3}>
                <NumberInput label="Yükseklik (cm)" min={0} {...form.getInputProps('height_cm')} />
              </Grid.Col>
              <Grid.Col span={3}>
                <NumberInput
                  label="Ağırlık (kg)"
                  min={0}
                  decimalScale={2}
                  {...form.getInputProps('weight_kg')}
                />
              </Grid.Col>
            </Grid>
            <Text mt="md" fw={600}>
              Ücretlendirme desisi: {desi.toFixed(2)}
            </Text>
          </Card>
        </Stepper.Step>

        <Stepper.Step label="Ek Hizmetler" description="Opsiyonlar">
          <Card withBorder padding="lg" mt="md">
            {form.values.pay_on_delivery && (
              <NumberInput
                label="Kapıda ödeme tutarı (₺)"
                min={0}
                decimalScale={2}
                mb="md"
                {...form.getInputProps('pod_amount')}
              />
            )}
            <Stack gap="sm">
              <Switch
                label="Kapıda Alıcı Ödemeli"
                checked={form.values.receiver_pays}
                onChange={(e) => form.setFieldValue('receiver_pays', e.currentTarget.checked)}
              />
              <Switch
                label="Kontrollü Teslimat"
                checked={form.values.controlled_delivery}
                onChange={(e) =>
                  form.setFieldValue('controlled_delivery', e.currentTarget.checked)
                }
              />
              <Switch
                label="Taslak Kargo Oluştur"
                checked={form.values.is_draft}
                onChange={(e) => form.setFieldValue('is_draft', e.currentTarget.checked)}
              />
            </Stack>
          </Card>
        </Stepper.Step>

        <Stepper.Step label="Teklif ve Özet" description="Fiyat ve etiket">
          <Grid mt="md">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card withBorder padding="lg" mb="md">
                <Title order={4} mb="md">
                  Kargo firması fiyat karşılaştırması
                </Title>
                <CarrierQuoteCompare
                  quotes={quoteResult?.quotes ?? []}
                  selectedId={resolvedCarrierId}
                  onSelect={setSelectedCarrierId}
                  loading={quoteLoading}
                />
              </Card>
              <Card withBorder padding="lg" className="label-designer-panel">
                <LabelDesigner value={labelSettings} onChange={setLabelSettings} />
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card withBorder padding="lg" className="label-preview-panel">
                <Group justify="space-between" mb="md">
                  <Title order={5}>Etiket önizleme</Title>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPrinter size={16} />}
                    onClick={handlePrint}
                  >
                    Yazdır
                  </Button>
                </Group>
                <Group justify="center">
                  <ShippingLabelPreview settings={labelSettings} data={labelData} />
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Stepper.Step>

        <Stepper.Completed>
          <Card withBorder padding="lg" mt="md">
            <Group>
              <IconCheck size={24} color="var(--mantine-color-teal-6)" />
              <Text fw={600}>Gönderi kaydı tamamlandı.</Text>
            </Group>
          </Card>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="md" className="no-print">
        <Button variant="subtle" onClick={() => form.reset()}>
          Temizle
        </Button>
        <Group>
          {active > 0 && (
            <Button variant="default" onClick={() => setActive((c) => c - 1)}>
              Geri
            </Button>
          )}
          {active < 3 && <Button onClick={nextStep}>İleri</Button>}
          {active === 3 && (
            <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
              Kargo Oluştur
            </Button>
          )}
        </Group>
      </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>{sidePanel}</Grid.Col>
      </Grid>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #kargomkapinda-shipping-label, #kargomkapinda-shipping-label * { visibility: visible; }
          #kargomkapinda-shipping-label {
            position: absolute;
            left: 0;
            top: 0;
          }
          .no-print, .label-designer-panel { display: none !important; }
        }
      `}</style>
    </Stack>
  )
}
