import { useCallback, useState } from 'react'
import type { CreateSignatureRequestResponse } from './api'

const buildSigningUrl = (hint: string): string => {
  // hint may be: a full path like "/sign/<token>", a relative "sign/<token>", or a bare "<token>"
  let path: string
  if (hint.includes('/sign/')) {
    // already contains the sign segment — normalise leading slash
    path = hint.startsWith('/') ? hint : `/${hint}`
  } else {
    // bare token or unknown path — wrap it
    const token = hint.startsWith('/') ? hint.slice(1) : hint
    path = `/sign/${token}`
  }
  return `${window.location.origin}${path}`
}

export const useSignatureRequestSigningUrls = () => {
  const [signingUrls, setSigningUrls] = useState<Record<number, string>>({})

  const rememberSigningUrl = useCallback((result: CreateSignatureRequestResponse) => {
    if (!result.signing_url_hint) return
    setSigningUrls((prev) => ({
      ...prev,
      [result.id]: buildSigningUrl(result.signing_url_hint),
    }))
  }, [])

  return {
    signingUrls,
    rememberSigningUrl,
  }
}
