import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

/**
 * Manages a local draft value for a search input with debounced commit.
 * Syncs back when the external value resets (e.g. URL-driven reset).
 */
export const useSearchDebounce = (externalValue: string, onCommit: (value: string) => void, delay = 350) => {
  const [draft, setDraft] = useState(externalValue)
  const [debounced] = useDebounce(draft, delay)

  // Latest values read by the commit effect without retriggering it — keeps the
  // effect dependent only on `debounced` while always firing the current onCommit.
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit
  const externalValueRef = useRef(externalValue)
  externalValueRef.current = externalValue

  // Sync draft when external value changes (e.g. reset from parent)
  useEffect(() => {
    setDraft(externalValue)
  }, [externalValue])

  // Commit debounced value when it diverges from external
  useEffect(() => {
    if (debounced !== externalValueRef.current) {
      onCommitRef.current(debounced)
    }
  }, [debounced])

  return [draft, setDraft] as const
}
