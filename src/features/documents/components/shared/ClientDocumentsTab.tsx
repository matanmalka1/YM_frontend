import { useState } from 'react'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { TableSkeleton, PaginationCard } from '@/components/ui/table'
import { DocumentsDataCards } from '../list/DocumentsDataCards'
import { useClientDocumentsTab } from '../../hooks/useClientDocumentsTab'
import { DOCUMENTS_MESSAGES } from '../../messages'

interface ClientDocumentsTabProps {
  clientId: number
}

export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps> = ({ clientId }) => {
  const [taxYear, setTaxYear] = useState<number | null>(null)

  const {
    documents,
    focusedDocumentId,
    signals,
    loading,
    error,
    businesses,
    businessesLoading,
    submitUpload,
    uploadError,
    uploading,
    handleDelete,
    handleReplace,
    handleUpdate,
    page,
    setPage,
    totalPages,
    total,
  } = useClientDocumentsTab(clientId, taxYear)

  if (loading) return <TableSkeleton rows={4} columns={2} />
  if (error) return <Alert variant="error" message={error} />

  return (
    <>
      <DocumentsDataCards
        documents={documents}
        focusedDocumentId={focusedDocumentId}
        signals={signals}
        taxYear={taxYear}
        onTaxYearChange={(year) => {
          setTaxYear(year)
          setPage(1)
        }}
        businesses={businesses}
        businessesLoading={businessesLoading}
        submitUpload={submitUpload}
        uploadError={uploadError}
        uploading={uploading}
        onDelete={handleDelete}
        onReplace={handleReplace}
        onUpdate={handleUpdate}
      />
      {totalPages > 1 && (
        <PaginationCard
          page={page}
          totalPages={totalPages}
          total={total}
          label={DOCUMENTS_MESSAGES.shared.paginationLabel}
          onPageChange={setPage}
        />
      )}
    </>
  )
}

ClientDocumentsTab.displayName = 'ClientDocumentsTab'
