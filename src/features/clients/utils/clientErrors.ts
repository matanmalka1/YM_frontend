import { isAxiosError } from 'axios'

export const extractClientErrorCode = (err: unknown): string | null => {
  if (!isAxiosError(err)) return null
  return err.response?.data?.error?.code ?? null
}
