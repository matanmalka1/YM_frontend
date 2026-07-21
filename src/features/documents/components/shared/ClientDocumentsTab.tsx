import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { TableSkeleton, PaginationCard } from '@/components/ui/table'
import { DetailTabPanel } from '@/components/ui/layout'
import { Button } from '@/components/ui/primitives/Button'
import { DocumentsDataCards } from '../list/DocumentsDataCards'
import { DocumentsFilterPanel } from '../list/DocumentsFilterPanel'
import { filterDocuments } from '../../utils/documentsDataCardsUtils'
import { useClientDocumentsTab } from '../../hooks/useClientDocumentsTab'
import { DOCUMENTS_MESSAGES } from '../../messages'

interface ClientDocumentsTabProps {
  clientId: number
}

export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps> = ({ clientId }) => {
  const [taxYear, setTaxYear] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const {
    documents,
    focusedDocumentId,
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

  const filteredDocuments = useMemo(() => filterDocuments(documents, search, filterType), [documents, filterType, search])

  return (
    <DetailTabPanel
      title={DOCUMENTS_MESSAGES.clientTab.title}
      subtitle={DOCUMENTS_MESSAGES.clientTab.subtitle}
      actions={
        <div className="flex items-center gap-2">
          <DocumentsFilterPanel
            search={search}
            onSearchChange={setSearch}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            taxYear={taxYear}
            onTaxYearChange={(year) => {
              setTaxYear(year)
              setPage(1)
            }}
          />
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
            {DOCUMENTS_MESSAGES.list.uploadButton}
          </Button>
        </div>
      }
    >
      {error ? (
        <Alert variant="error" message={error} />
      ) : loading ? (
        <TableSkeleton rows={4} columns={2} />
      ) : (
        <>
          <DocumentsDataCards
            documents={filteredDocuments}
            hasDocuments={documents.length > 0}
            focusedDocumentId={focusedDocumentId}
            taxYear={taxYear}
            businesses={businesses}
            businessesLoading={businessesLoading}
            submitUpload={submitUpload}
            uploadError={uploadError}
            uploading={uploading}
            onDelete={handleDelete}
            onReplace={handleReplace}
            onUpdate={handleUpdate}
            uploadOpen={uploadOpen}
            onOpenUpload={() => setUploadOpen(true)}
            onCloseUpload={() => setUploadOpen(false)}
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
      )}
    </DetailTabPanel>
  )
}

ClientDocumentsTab.displayName = 'ClientDocumentsTab'
