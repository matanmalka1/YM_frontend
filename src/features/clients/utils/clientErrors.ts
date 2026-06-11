import { getApiErrorBody } from '@/utils/utils'

export const extractClientErrorCode = (err: unknown): string | null => {
  return getApiErrorBody(err)?.code ?? null
}
