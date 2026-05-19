import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/primitives/Card'
import { documentsApi, documentsQK } from '../api'
import { getDocumentTypeLabel } from './DocumentsDataCards.utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

interface MissingDocumentsNoticeProps {
  clientId: number
  showCompleteState?: boolean
}

export const MissingDocumentsNotice: React.FC<MissingDocumentsNoticeProps> = ({
  clientId,
  showCompleteState = false,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: documentsQK.clientSignals(clientId),
    queryFn: () => documentsApi.getSignalsByClient(clientId),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
  })

  if (isLoading || isError) return null

  const missingDocuments = data?.missing_documents ?? []

  if (missingDocuments.length === 0) {
    if (!showCompleteState) return null

    return (
      <Card className="border-emerald-200 bg-emerald-50/70">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-950">כל מסמכי החובה קיימים</p>
            <p className="mt-1 text-sm text-emerald-800">אין כרגע מסמכים חסרים בפרטי הלקוח.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-white [&>div]:p-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-amber-950">חסרים {missingDocuments.length} מסמכים בפרטי הלקוח</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {missingDocuments.map((documentType) => (
                <span
                  key={documentType}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-1.5 text-sm font-semibold text-amber-900"
                >
                  <FileText className="h-4 w-4" />
                  {getDocumentTypeLabel(documentType)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Link
          to={`/clients/${clientId}/documents`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-50"
        >
          מעבר למסמכים
        </Link>
      </div>
    </Card>
  )
}

MissingDocumentsNotice.displayName = 'MissingDocumentsNotice'
