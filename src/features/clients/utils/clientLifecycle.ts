import type { ClientStatus } from '../api'

export const isClientClosed = (status?: ClientStatus | null): boolean => status === 'closed'
export const isClientLockedForCreate = (status?: ClientStatus | null): boolean => status === 'closed' || status === 'frozen'
