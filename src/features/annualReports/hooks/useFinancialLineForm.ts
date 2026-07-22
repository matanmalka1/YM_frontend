import { useState, type FormEvent } from 'react'
import type { ExpenseCategoryType, ExpenseLineResponse, IncomeLineResponse, IncomeSourceType } from '../api'
import {
  buildExpensePayload,
  buildIncomePayload,
  isExpenseCategoryType,
  isIncomeSourceType,
  type AddExpensePayload,
  type IncomeFormPayload,
} from '../utils/financialHelpers'

export const useIncomeLineForm = (initial?: IncomeLineResponse, onSubmit?: (payload: IncomeFormPayload) => void) => {
  const [typeKey, setTypeKey] = useState<IncomeSourceType | ''>(initial?.source_type ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTypeKey('')
    setAmount('')
    setDescription('')
    setError(null)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = buildIncomePayload(typeKey, amount, description)
    if (!result.payload) return setError(result.error ?? null)
    onSubmit?.(result.payload)
    return result.payload
  }

  return {
    typeKey,
    setTypeKey: (value: string) => setTypeKey(isIncomeSourceType(value) ? value : ''),
    amount,
    setAmount,
    description,
    setDescription,
    error,
    reset,
    submit,
  }
}

export const useExpenseLineForm = (initial?: ExpenseLineResponse, onSubmit?: (payload: AddExpensePayload) => void) => {
  const [category, setCategory] = useState<ExpenseCategoryType | ''>(initial?.category ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [recognitionRate, setRecognitionRate] = useState(initial ? String(Number(initial.recognition_rate) * 100) : '')
  const [documentReference, setDocumentReference] = useState(initial?.external_document_reference ?? '')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setCategory('')
    setAmount('')
    setDescription('')
    setRecognitionRate('')
    setDocumentReference('')
    setError(null)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = buildExpensePayload(category, amount, description, recognitionRate, documentReference)
    if (!result.payload) return setError(result.error ?? null)
    onSubmit?.(result.payload)
    return result.payload
  }

  return {
    category,
    setCategory: (value: string) => setCategory(isExpenseCategoryType(value) ? value : ''),
    amount,
    setAmount,
    description,
    setDescription,
    recognitionRate,
    setRecognitionRate,
    documentReference,
    setDocumentReference,
    error,
    reset,
    submit,
  }
}
