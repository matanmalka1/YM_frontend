import { useState } from 'react'
import type { BinderResponse } from '../types'

interface UseBindersPageDialogsParams {
  getSelectedBinder: () => BinderResponse | null
  markReadyForHandover: (binderId: number) => Promise<unknown>
  markReadyForHandoverBulk: (clientId: number, untilPeriodYear: number, untilPeriodMonth: number) => Promise<unknown>
  handoverToClient: (binderId: number, handoverRecipientName: string) => Promise<unknown>
  handoverToClientBulk: (
    clientId: number,
    binderIds: number[],
    receivedByName: string,
    handedOverAt: string,
    untilPeriodYear: number,
    untilPeriodMonth: number,
    notes?: string | null,
  ) => Promise<unknown>
  deleteBinder: (binderId: number) => Promise<unknown>
}

export const useBindersPageDialogs = ({
  getSelectedBinder,
  markReadyForHandover,
  markReadyForHandoverBulk,
  handoverToClient,
  handoverToClientBulk,
  deleteBinder,
}: UseBindersPageDialogsParams) => {
  const [confirmDeleteForId, setConfirmDeleteForId] = useState<number | null>(null)
  const [confirmHandoverForId, setConfirmHandoverForId] = useState<number | null>(null)
  const [confirmReadyForHandoverForId, setConfirmReadyForHandoverForId] = useState<number | null>(null)
  const [handoverRecipientName, setHandoverRecipientName] = useState('')
  const [bulkReadyForHandoverOpen, setBulkReadyForHandoverOpen] = useState(false)
  const [handoverToClientBulkOpen, setHandoverToClientBulkOpen] = useState(false)
  const [bulkReadyForHandoverYear, setBulkReadyForHandoverYear] = useState(new Date().getFullYear())
  const [bulkReadyForHandoverMonth, setBulkReadyForHandoverMonth] = useState(new Date().getMonth() + 1)
  const [dialogBinder, setDialogBinder] = useState<BinderResponse | null>(null)

  const openDeleteDialog = (binderId: number) => setConfirmDeleteForId(binderId)
  const closeDeleteDialog = () => setConfirmDeleteForId(null)

  const openReadyForHandoverDialog = (binderId: number) => setConfirmReadyForHandoverForId(binderId)
  const closeReadyForHandoverDialog = () => setConfirmReadyForHandoverForId(null)

  const openHandoverToClientDialog = (binderId: number) => setConfirmHandoverForId(binderId)
  const closeHandoverToClientDialog = () => {
    setConfirmHandoverForId(null)
    setHandoverRecipientName('')
  }

  const openBulkReadyForHandoverDialog = (binder?: BinderResponse) => {
    setDialogBinder(binder ?? getSelectedBinder())
    setBulkReadyForHandoverOpen(true)
  }
  const closeBulkReadyForHandoverDialog = () => {
    setBulkReadyForHandoverOpen(false)
    setDialogBinder(null)
  }

  const openHandoverToClientBulkDialog = (binder?: BinderResponse) => {
    setDialogBinder(binder ?? getSelectedBinder())
    setHandoverToClientBulkOpen(true)
  }
  const closeHandoverToClientBulkDialog = () => {
    setHandoverToClientBulkOpen(false)
    setDialogBinder(null)
  }

  const confirmHandoverToClient = async () => {
    if (confirmHandoverForId === null) return
    await handoverToClient(confirmHandoverForId, handoverRecipientName)
    closeHandoverToClientDialog()
  }

  const confirmDelete = async () => {
    if (confirmDeleteForId === null) return
    await deleteBinder(confirmDeleteForId)
    closeDeleteDialog()
  }

  const confirmReadyForHandover = async () => {
    if (confirmReadyForHandoverForId === null) return
    await markReadyForHandover(confirmReadyForHandoverForId)
    closeReadyForHandoverDialog()
  }

  const confirmBulkReadyForHandover = async () => {
    const binder = dialogBinder
    if (!binder) return
    await markReadyForHandoverBulk(binder.client_record_id, bulkReadyForHandoverYear, bulkReadyForHandoverMonth)
    closeBulkReadyForHandoverDialog()
  }

  const submitHandoverToClientBulk = async (payload: {
    binderIds: number[]
    receivedByName: string
    handedOverAt: string
    untilPeriodYear: number
    untilPeriodMonth: number
    notes: string | null
  }) => {
    const binder = dialogBinder
    if (!binder) return
    await handoverToClientBulk(
      binder.client_record_id,
      payload.binderIds,
      payload.receivedByName,
      payload.handedOverAt,
      payload.untilPeriodYear,
      payload.untilPeriodMonth,
      payload.notes,
    )
    closeHandoverToClientBulkDialog()
  }

  return {
    bulkReadyForHandoverMonth,
    bulkReadyForHandoverOpen,
    bulkReadyForHandoverYear,
    closeBulkReadyForHandoverDialog,
    closeDeleteDialog,
    closeHandoverToClientBulkDialog,
    closeHandoverToClientDialog,
    confirmBulkReadyForHandover,
    confirmDelete,
    confirmDeleteForId,
    confirmHandoverForId,
    confirmHandoverToClient,
    confirmReadyForHandover,
    confirmReadyForHandoverForId,
    openReadyForHandoverDialog,
    closeReadyForHandoverDialog,
    dialogBinder,
    handoverRecipientName,
    handoverToClientBulkOpen,
    openBulkReadyForHandoverDialog,
    openDeleteDialog,
    openHandoverToClientBulkDialog,
    openHandoverToClientDialog,
    setBulkReadyForHandoverMonth,
    setBulkReadyForHandoverYear,
    setHandoverRecipientName,
    submitHandoverToClientBulk,
  }
}
