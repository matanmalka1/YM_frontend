import { type FC, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '@/utils/utils'
import { type ActiveClientDetailsTab } from '../../constants'
import { Trash2 } from 'lucide-react'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { Button } from '../../../../components/ui/primitives/Button'
import { DeleteClientModal } from './DeleteClientModal'
import { AuthorityContactsCard } from '@/features/authorityContacts'
import { CorrespondenceCard } from '@/features/correspondence'
import { SignatureRequestsCard } from '@/features/signatureRequests'
import { ClientStatusCard } from './ClientStatusCard'
import { ClientInfoSection } from './ClientInfoSection'
import { ClientBusinessesCard } from './ClientBusinessesCard'
import { ClientRelatedData } from './ClientRelatedData'
import { CreateBusinessModal } from '../business/CreateBusinessModal'
import { ClientEditForm } from '../edit/ClientEditForm'
import { ChargesCreateModal, ClientChargesTab } from '@/features/charges'
import { ClientTimelineTab } from '@/features/timeline'
import { ClientAnnualReportsTab } from '@/features/annualReports'
import { ClientAdvancePaymentsTab } from '@/features/advancedPayments'
import { ClientDocumentsTab } from '@/features/documents'
import { ClientNotesCard } from '@/features/notes'
import { NotificationsTab } from '@/features/notifications'
import { ClientTaxCalendarTab } from '@/features/taxCalendar'
import { VatClientSummaryPanel } from '@/features/vatReports'
import { ClientAuditTrailSection } from './ClientAuditTrailSection'
import { ClientTasksTab } from '@/features/tasks'
import type { UpdateClientPayload, ClientRecordResponse } from '../../api'
import { useFirstBusinessId } from '../../hooks/useFirstBusinessId'
import { useClientDetailsActions } from '../../hooks/useClientDetailsActions'

const EDIT_FORM_ID = 'client-edit-form'

export type ClientDetailsOverviewTabProps = {
  client: ClientRecordResponse
  clientId: number
  canEditClients: boolean
  updateClient: (payload: UpdateClientPayload) => Promise<void>
  isUpdating: boolean
  deleteClient: () => Promise<void>
  isDeleting: boolean
  activeTab: ActiveClientDetailsTab
  isEditing: boolean
  onEditClose: () => void
}

export const ClientDetailsOverviewTab: FC<ClientDetailsOverviewTabProps> = ({
  client,
  canEditClients,
  updateClient,
  isUpdating,
  deleteClient,
  isDeleting,
  activeTab,
  isEditing,
  onEditClose,
}) => {
  const { id: firstBusinessId } = useFirstBusinessId(client.id, activeTab === 'communication')
  const navigate = useNavigate()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isAddingBusiness, setIsAddingBusiness] = useState(false)
  const [isAddingCharge, setIsAddingCharge] = useState(false)
  const [shouldLoadRelatedData, setShouldLoadRelatedData] = useState(false)

  useEffect(() => {
    setShouldLoadRelatedData(false)
  }, [client.id])

  const requestRelatedDataLoad = useCallback(() => {
    setShouldLoadRelatedData(true)
  }, [])

  const openCreateCharge = useCallback(() => {
    setShouldLoadRelatedData(true)
    setIsAddingCharge(true)
  }, [])

  const {
    binders,
    bindersTotal,
    charges,
    chargesTotal,
    isFetchingRelatedData,
    handleCreateBusiness,
    isCreatingBusiness,
    handleCreateCharge,
    isCreatingCharge,
    createChargeError,
  } = useClientDetailsActions(client.id, activeTab, shouldLoadRelatedData)

  return (
    <div className="space-y-6">
      {activeTab === 'details' && (
        <>
          <ClientInfoSection client={client} />
          <ClientStatusCard clientId={client.id} />
          <ClientBusinessesCard
            clientId={client.id}
            canEdit={canEditClients}
            onAddBusiness={() => setIsAddingBusiness(true)}
          />
          <ClientRelatedData
            clientId={client.id}
            binders={binders}
            bindersTotal={bindersTotal}
            charges={charges}
            chargesTotal={chargesTotal}
            hasRequestedData={shouldLoadRelatedData}
            isFetching={isFetchingRelatedData}
            canViewCharges={true}
            canCreateCharge={canEditClients}
            onCreateCharge={openCreateCharge}
            onCreateBinder={() => navigate(`/binders?client_record_id=${client.id}`)}
            onRequestLoad={requestRelatedDataLoad}
          />
          <CreateBusinessModal
            open={isAddingBusiness}
            onClose={() => setIsAddingBusiness(false)}
            onSubmit={handleCreateBusiness}
            isLoading={isCreatingBusiness}
          />
          <ChargesCreateModal
            open={isAddingCharge}
            createError={createChargeError ? getErrorMessage(createChargeError, 'שגיאה ביצירת חיוב') : null}
            createLoading={isCreatingCharge}
            onClose={() => setIsAddingCharge(false)}
            onSubmit={handleCreateCharge}
            initialClient={{ id: client.id, name: client.full_name }}
          />
        </>
      )}

      {activeTab === 'communication' && (
        <div className="space-y-6">
          <AuthorityContactsCard clientId={client.id} />
          <CorrespondenceCard businessId={firstBusinessId ?? undefined} clientId={client.id} />
          <SignatureRequestsCard client={client} businessId={firstBusinessId ?? undefined} canManage={canEditClients} />
        </div>
      )}

      {activeTab === 'timeline' && <ClientTimelineTab clientId={String(client.id)} />}
      {activeTab === 'documents' && <ClientDocumentsTab clientId={client.id} />}
      {activeTab === 'charges' && <ClientChargesTab clientId={client.id} clientName={client.full_name} />}
      {activeTab === 'vat' && <VatClientSummaryPanel clientId={client.id} />}
      {activeTab === 'tax-calendar' && <ClientTaxCalendarTab clientId={client.id} />}
      {activeTab === 'advance-payments' && (
        <ClientAdvancePaymentsTab
          clientId={client.id}
          clientName={client.full_name}
          clientIdNumber={client.id_number}
          officeClientNumber={client.office_client_number}
        />
      )}
      {activeTab === 'annual-reports' && <ClientAnnualReportsTab clientId={client.id} />}
      {activeTab === 'notifications' && <NotificationsTab clientRecordId={client.id} />}
      {activeTab === 'notes' && <ClientNotesCard clientId={client.id} canEdit={canEditClients} />}
      {activeTab === 'history' && <ClientAuditTrailSection clientId={client.id} />}
      {activeTab === 'tasks' && <ClientTasksTab clientRecordId={client.id} />}

      <DeleteClientModal
        open={isConfirmingDelete}
        clientName={client.full_name}
        isDeleting={isDeleting}
        onConfirm={async () => {
          await deleteClient()
          setIsConfirmingDelete(false)
        }}
        onCancel={() => setIsConfirmingDelete(false)}
      />

      {canEditClients && (
        <DetailDrawer
          open={isEditing}
          title="עריכת פרטי לקוח"
          subtitle={client.full_name}
          onClose={onEditClose}
          footer={
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onEditClose()
                  setIsConfirmingDelete(true)
                }}
                disabled={isUpdating}
                className="gap-2 text-negative-600 border-negative-200 hover:bg-negative-50"
              >
                <Trash2 className="h-4 w-4" />
                מחק לקוח
              </Button>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={onEditClose} disabled={isUpdating}>
                  ביטול
                </Button>
                <Button type="submit" form={EDIT_FORM_ID} variant="ghost" isLoading={isUpdating} disabled={isUpdating}>
                  שמור שינויים
                </Button>
              </div>
            </div>
          }
        >
          <ClientEditForm
            client={client}
            formId={EDIT_FORM_ID}
            hideFooter
            onSave={async (data) => {
              await updateClient(data)
              onEditClose()
            }}
            onCancel={onEditClose}
            isLoading={isUpdating}
          />
        </DetailDrawer>
      )}
    </div>
  )
}
