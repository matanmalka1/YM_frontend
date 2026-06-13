import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authorityContactsApi, authorityContactsQK, type AuthorityContactResponse } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { authorityContactSchema, authorityContactDefaults, type AuthorityContactFormValues } from '../schemas'
import { toast } from '../../../utils/toast'
import { AUTHORITY_CONTACT_TEXT } from '../constants'
import { toAuthorityContactFormValues, toAuthorityContactPayload } from '../helpers'

export const useAuthorityContactForm = (
  clientId: number,
  onSuccess: () => void,
  existing?: AuthorityContactResponse | null,
) => {
  const queryClient = useQueryClient()
  const qk = authorityContactsQK.forClient(clientId)

  const form = useForm<AuthorityContactFormValues>({
    resolver: zodResolver(authorityContactSchema),
    defaultValues: authorityContactDefaults,
  })

  useEffect(() => {
    form.reset(toAuthorityContactFormValues(existing))
  }, [existing, form])

  const saveMutation = useMutation({
    mutationFn: (values: AuthorityContactFormValues) => {
      const payload = toAuthorityContactPayload(values)
      return existing
        ? authorityContactsApi.updateAuthorityContact(clientId, existing.id, payload)
        : authorityContactsApi.createAuthorityContact(clientId, payload)
    },
    onSuccess: () => {
      toast.success(existing ? AUTHORITY_CONTACT_TEXT.updateSuccess : AUTHORITY_CONTACT_TEXT.createSuccess)
      queryClient.invalidateQueries({ queryKey: qk })
      onSuccess()
    },
    onError: (err) => showErrorToast(err, AUTHORITY_CONTACT_TEXT.saveError),
  })

  const onSubmit = form.handleSubmit((values) => saveMutation.mutate(values))

  return { form, onSubmit, isSaving: saveMutation.isPending }
}
