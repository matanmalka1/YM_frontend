import { api } from '@/api/client'
import { NOTES_ENDPOINTS } from './endpoints'
import type { CreateNotePayload, EntityNote, EntityNoteListResponse, UpdateNotePayload } from './contracts'

export const notesApi = {
  list: async (clientId: number, params?: { page?: number; page_size?: number }): Promise<EntityNoteListResponse> => {
    const response = await api.get<EntityNoteListResponse>(NOTES_ENDPOINTS.notesList(clientId), {
      params,
    })
    return response.data
  },

  create: async (clientId: number, payload: CreateNotePayload): Promise<EntityNote> => {
    const response = await api.post<EntityNote>(NOTES_ENDPOINTS.notesList(clientId), payload)
    return response.data
  },

  update: async (clientId: number, noteId: number, payload: UpdateNotePayload): Promise<EntityNote> => {
    const response = await api.patch<EntityNote>(NOTES_ENDPOINTS.noteById(clientId, noteId), payload)
    return response.data
  },

  delete: async (clientId: number, noteId: number): Promise<void> => {
    await api.delete(NOTES_ENDPOINTS.noteById(clientId, noteId))
  },

  listForBusiness: async (
    clientId: number,
    businessId: number,
    params?: { page?: number; page_size?: number },
  ): Promise<EntityNoteListResponse> => {
    const response = await api.get<EntityNoteListResponse>(NOTES_ENDPOINTS.businessNotesList(clientId, businessId), {
      params,
    })
    return response.data
  },

  createForBusiness: async (clientId: number, businessId: number, payload: CreateNotePayload): Promise<EntityNote> => {
    const response = await api.post<EntityNote>(NOTES_ENDPOINTS.businessNotesList(clientId, businessId), payload)
    return response.data
  },

  updateForBusiness: async (
    clientId: number,
    businessId: number,
    noteId: number,
    payload: UpdateNotePayload,
  ): Promise<EntityNote> => {
    const response = await api.patch<EntityNote>(NOTES_ENDPOINTS.businessNoteById(clientId, businessId, noteId), payload)
    return response.data
  },

  deleteForBusiness: async (clientId: number, businessId: number, noteId: number): Promise<void> => {
    await api.delete(NOTES_ENDPOINTS.businessNoteById(clientId, businessId, noteId))
  },
}
