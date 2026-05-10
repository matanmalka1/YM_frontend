import { isAxiosError } from 'axios'

export const extractClientErrorCode = (err: unknown): string | null => {
  if (!isAxiosError(err)) return null
  return err.response?.data?.error ?? err.response?.data?.code ?? err.response?.data?.detail?.error ?? null
}
