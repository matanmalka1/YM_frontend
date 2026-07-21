import { type FC, useState } from 'react'
import { type ActiveClientDetailsTab } from '../../constants'
import { Trash2 } from 'lucide-react'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { Button } from '../../../../components/ui/primitives/Button'
import { DeleteClientModal } from './DeleteClientModal'
import { AuthorityContactsCard } from '@/features/authorityContacts'
import { CorrespondenceCard } from '@/features/correspondence'
import { SignatureRequestsCard } from '@/features/signatureRequests'
import { ClientStatusCard } from './ClientStatusCard'
import { ClientInfoSection } from './ClientInfoSection'
import { ClientBusinessesCard } from './ClientBusinessesCard'
import { ClientRelatedData } from './ClientRelatedData'
import { CreateBusinessModal } from '../form/CreateBusinessModal'
import { ClientEditForm } from '../form/ClientEditForm'
import { ClientChargesTab } from '@/features/charges'
import { ClientTimelineTab } from '@/features/timeline'
import { ClientAnnualReportsTab } from '@/features/annualReports'
import { ClientAdvancePaymentsTab } from '@/features/advancedPayments'
import { ClientBindersTab } from '@/features/binders'
import { ClientDocumentsTab } from '@/features/documents'
import { NotesCard } from '@/features/notes'
import { NotificationsTab } from '@/features/notifications'
import { ClientTaxCalendarTab } from '@/features/taxCalendar'
import { VatClientSummaryPanel } from '@/features/vatReports'
import { ClientTasksTab } from '@/features/tasks'
import type { UpdateClientPayload, ClientRecordResponse } from '../../api'
import { useClientDetailsActions } from '../../hooks/useClientDetailsActions'
import { CLIENTS_MESSAGES } from '../../messages'

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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isEditDirty, setIsEditDirty] = useState(false)
  const [isAddingBusiness, setIsAddingBusiness] = useState(false)

  const { bindersTotal, chargesTotal, isFetchingRelatedData, handleCreateBusiness, isCreatingBusiness } = useClientDetailsActions(
    client.id,
    activeTab,
  )

  return (
    <div className="space-y-6">
      {activeTab === 'details' && (
        <>
          <ClientInfoSection client={client} />
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ClientStatusCard clientId={client.id} />
            <ClientBusinessesCard clientId={client.id} canEdit={canEditClients} onAddBusiness={() => setIsAddingBusiness(true)} />
          </div>
          <ClientRelatedData
            clientId={client.id}
            bindersTotal={bindersTotal}
            chargesTotal={chargesTotal}
            isFetching={isFetchingRelatedData}
          />
          <CreateBusinessModal
            open={isAddingBusiness}
            onClose={() => setIsAddingBusiness(false)}
            onSubmit={handleCreateBusiness}
            isLoading={isCreatingBusiness}
          />
        </>
      )}

      {activeTab === 'communication' && (
        <div className="space-y-6">
          <AuthorityContactsCard clientId={client.id} />
          <CorrespondenceCard clientId={client.id} />
          <SignatureRequestsCard client={client} canManage={canEditClients} />
        </div>
      )}

      {activeTab === 'timeline' && <ClientTimelineTab clientId={String(client.id)} />}
      {activeTab === 'documents' && <ClientDocumentsTab clientId={client.id} />}
      {activeTab === 'binders' && <ClientBindersTab clientId={client.id} clientName={client.full_name} />}
      {activeTab === 'charges' && <ClientChargesTab clientId={client.id} clientName={client.full_name} />}
      {activeTab === 'vat' && <VatClientSummaryPanel clientId={client.id} />}
      {activeTab === 'tax-calendar' && <ClientTaxCalendarTab clientId={client.id} />}
      {activeTab === 'advance-payments' && <ClientAdvancePaymentsTab clientRecordId={client.id} />}
      {activeTab === 'annual-reports' && <ClientAnnualReportsTab clientId={client.id} />}
      {activeTab === 'notifications' && <NotificationsTab clientRecordId={client.id} clientName={client.full_name} />}
      {activeTab === 'notes' && <NotesCard scope="client" clientId={client.id} canEdit={canEditClients} />}
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
          title={CLIENTS_MESSAGES.edit.overviewDrawerTitle}
          subtitle={client.full_name}
          onClose={onEditClose}
          isDirty={isEditDirty}
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
                {CLIENTS_MESSAGES.edit.deleteClient}
              </Button>
              <ModalFormActions
                cancelVariant="ghost"
                isLoading={isUpdating}
                submitForm={EDIT_FORM_ID}
                submitLabel={CLIENTS_MESSAGES.edit.saveChanges}
                submitType="submit"
                submitVariant="ghost"
              />
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
            onDirtyChange={setIsEditDirty}
            isLoading={isUpdating}
          />
        </DetailDrawer>
      )}
    </div>
  )
}
