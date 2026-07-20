import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/utils/utils'
import { taxCalendarApi, taxCalendarQK } from '../api'
import { getClientTaxCalendarItemPath } from '../helpers'
import { TAX_CALENDAR_ERROR_MESSAGES } from '../errorMessages'

const ITEM_LOOKUP_PAGE_SIZE = 1

export const useOpenClientTaxCalendarItem = (clientRecordId: number) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [openingEntryId, setOpeningEntryId] = useState<number | null>(null)
  const [errorEntryId, setErrorEntryId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [missingEntryId, setMissingEntryId] = useState<number | null>(null)

  const openItem = useCallback(
    async (taxCalendarEntryId: number) => {
      setOpeningEntryId(taxCalendarEntryId)
      setErrorEntryId(null)
      setErrorMessage(null)
      setMissingEntryId(null)

      const params = {
        page: 1,
        page_size: ITEM_LOOKUP_PAGE_SIZE,
        client_record_id: clientRecordId,
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: taxCalendarQK.groupItems(taxCalendarEntryId, params),
          queryFn: () => taxCalendarApi.getGroupItems(taxCalendarEntryId, params),
        })
        const item = data.items[0]
        if (!item) {
          setMissingEntryId(taxCalendarEntryId)
          return
        }
        navigate(getClientTaxCalendarItemPath(item))
      } catch (error) {
        setErrorEntryId(taxCalendarEntryId)
        setErrorMessage(getErrorMessage(error, TAX_CALENDAR_ERROR_MESSAGES.clientTab.itemOpen))
      } finally {
        setOpeningEntryId(null)
      }
    },
    [clientRecordId, navigate, queryClient],
  )

  return {
    openItem,
    openingEntryId,
    errorEntryId,
    errorMessage,
    missingEntryId,
  }
}
