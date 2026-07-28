import { useState } from 'react'
import { getAllowedTransitions } from '../constants/display'
import type { StatusTransitionPanelProps, TransitionForm } from '../types'
import { buildTransitionPayload, getEmptyTransitionForm } from '../utils/statusTransitionHelpers'

export const useStatusTransitionPanel = (
  report: StatusTransitionPanelProps['report'],
  onTransition: StatusTransitionPanelProps['onTransition'],
) => {
  const allowed = getAllowedTransitions(report)
  const [selected, setSelected] = useState<(typeof allowed)[number] | null>(null)
  const [form, setForm] = useState<TransitionForm>(getEmptyTransitionForm)
  const [readinessOpen, setReadinessOpen] = useState(false)

  const setField = (field: keyof TransitionForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const select = (status: (typeof allowed)[number]) => {
    setSelected((current) => (current === status ? null : status))
    setForm(getEmptyTransitionForm())
  }

  const submitTransition = () => {
    if (!selected) return
    onTransition(buildTransitionPayload(selected, form))
    setSelected(null)
    setForm(getEmptyTransitionForm())
  }

  const cancelTransition = () => {
    setSelected(null)
    setForm(getEmptyTransitionForm())
  }

  return {
    allowed,
    selected,
    form,
    readinessOpen,
    toggleReadiness: () => setReadinessOpen((current) => !current),
    setField,
    select,
    submitTransition,
    cancelTransition,
  }
}
