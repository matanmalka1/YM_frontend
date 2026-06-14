import type { ClientStatus } from '@/features/clients/api'

export const isClientClosed = (s?: ClientStatus | string | null): boolean => s === 'closed'
export const isClientLockedForCreate = (s?: ClientStatus | string | null): boolean => s === 'closed' || s === 'frozen'
