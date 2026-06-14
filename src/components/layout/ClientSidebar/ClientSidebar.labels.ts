import { ENTITY_TYPE_LABELS, VAT_TYPE_LABELS } from '@/features/clients/constants'
import type { ClientSidebarItem } from './useClientSidebarClients'

export const getEntityLabel = (client: ClientSidebarItem): string =>
  client.entityType ? ENTITY_TYPE_LABELS[client.entityType] : 'ללא סוג'

export const getVatLabel = (client: ClientSidebarItem): string =>
  client.vatReportingFrequency ? VAT_TYPE_LABELS[client.vatReportingFrequency] : 'ללא תדירות'
