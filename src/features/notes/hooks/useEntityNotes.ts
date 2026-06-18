import { notesApi, notesQK } from '../api'
import { notesPageParams, useNotesResource } from './useNotesResource'

export type NotesTarget =
  | { scope: 'client'; clientId: number }
  | { scope: 'business'; clientId: number; businessId: number }

export const useEntityNotes = (target: NotesTarget) => {
  const { clientId } = target

  const options =
    target.scope === 'business'
      ? {
          enabled: clientId > 0 && target.businessId > 0,
          queryKey: [...notesQK.forBusiness(target.businessId), notesPageParams],
          list: () => notesApi.listForBusiness(clientId, target.businessId, notesPageParams),
          create: (note: string) => notesApi.createForBusiness(clientId, target.businessId, { note }),
          update: (noteId: number, note: string) =>
            notesApi.updateForBusiness(clientId, target.businessId, noteId, { note }),
          remove: (noteId: number) => notesApi.deleteForBusiness(clientId, target.businessId, noteId),
        }
      : {
          enabled: clientId > 0,
          queryKey: [...notesQK.forClient(clientId), notesPageParams],
          list: () => notesApi.list(clientId, notesPageParams),
          create: (note: string) => notesApi.create(clientId, { note }),
          update: (noteId: number, note: string) => notesApi.update(clientId, noteId, { note }),
          remove: (noteId: number) => notesApi.delete(clientId, noteId),
        }

  return useNotesResource(options)
}
