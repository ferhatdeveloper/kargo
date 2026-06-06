import {
  Button,
  Drawer,
  Group,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useState } from 'react'
import {
  LABEL_STATUS_OPTIONS,
  LAST_MOVEMENT_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '@/config/stocadoCatalog'
import type { CargoFilters } from '@/types/cargo'

export interface CargoFiltersDrawerProps {
  opened: boolean
  onClose: () => void
  value: CargoFilters
  onApply: (filters: CargoFilters) => void
}

export function CargoFiltersDrawer({
  opened,
  onClose,
  value,
  onApply,
}: CargoFiltersDrawerProps) {
  const [draft, setDraft] = useState<CargoFilters>(value)

  const patch = (partial: CargoFilters) => setDraft((d) => ({ ...d, ...partial }))

  const handleOpen = () => setDraft(value)

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      onEnterTransitionEnd={handleOpen}
      position="right"
      size="md"
      title="Filtreler"
    >
      <Stack gap="md">
        <TextInput placeholder="Filtrelerde ara..." size="sm" />

        <div>
          <Text size="sm" fw={600} mb={4}>
            Son Hareket Tarihi
          </Text>
          <Group grow>
            <DateInput
              placeholder="Başlangıç"
              valueFormat="DD.MM.YYYY"
              value={draft.created_from ? new Date(draft.created_from) : null}
              onChange={(d) =>
                patch({ created_from: d ? new Date(d).toISOString() : undefined })
              }
            />
            <DateInput
              placeholder="Bitiş"
              valueFormat="DD.MM.YYYY"
              value={draft.created_to ? new Date(draft.created_to) : null}
              onChange={(d) =>
                patch({ created_to: d ? new Date(d).toISOString() : undefined })
              }
            />
          </Group>
        </div>

        <div>
          <Text size="sm" fw={600} mb={4}>
            Kapıda Ödeme
          </Text>
          <Radio.Group
            value={
              draft.pay_on_delivery === undefined
                ? ''
                : draft.pay_on_delivery
                  ? 'yes'
                  : 'no'
            }
            onChange={(v) =>
              patch({
                pay_on_delivery: v === '' ? undefined : v === 'yes',
              })
            }
          >
            <Group>
              <Radio value="yes" label="Evet" />
              <Radio value="no" label="Hayır" />
            </Group>
          </Radio.Group>
        </div>

        <Select
          label="Ödeme Durumu"
          placeholder="Seçiniz"
          clearable
          data={[...PAYMENT_STATUS_OPTIONS]}
          value={draft.payment_status ?? null}
          onChange={(v) => patch({ payment_status: v ?? undefined })}
        />

        <Select
          label="Etiket Durumu"
          placeholder="Seçiniz"
          clearable
          data={LABEL_STATUS_OPTIONS.map((l) => ({
            value: l === 'Yazdırıldı' ? 'true' : 'false',
            label: l,
          }))}
          value={
            draft.label_printed === undefined ? null : draft.label_printed ? 'true' : 'false'
          }
          onChange={(v) =>
            patch({
              label_printed: v === null ? undefined : v === 'true',
            })
          }
        />

        <Group grow>
          <NumberInput
            label="Kullanıcı Desi (Min)"
            min={0}
            value={draft.desi_min}
            onChange={(v) => patch({ desi_min: typeof v === 'number' ? v : undefined })}
          />
          <NumberInput
            label="Kullanıcı Desi (Max)"
            min={0}
            value={draft.desi_max}
            onChange={(v) => patch({ desi_max: typeof v === 'number' ? v : undefined })}
          />
        </Group>

        <MultiSelect
          label="Son Hareket"
          placeholder="Durum seçin"
          searchable
          data={[...LAST_MOVEMENT_OPTIONS]}
          value={draft.last_movements ?? []}
          onChange={(v) => patch({ last_movements: v.length ? v : undefined })}
        />

        <Group justify="space-between" mt="xl">
          <Button
            variant="subtle"
            onClick={() => {
              setDraft({})
              onApply({})
            }}
          >
            Temizle
          </Button>
          <Button
            onClick={() => {
              onApply(draft)
              onClose()
            }}
          >
            Sorgula
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}
