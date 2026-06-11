import type {
  CreateVatInvoicePayload,
  CreateVatWorkItemPayload,
  UpdateVatInvoicePayload,
  VatInvoiceResponse,
  VatWorkItemStatus,
  VatWorkItemResponse,
  VatWorkItemListItem,
} from './api'
import type { VatPeriodTypeFilter } from './constants'
import type { ExpenseCategoryRow } from './vatBreakdown.utils'

export interface VatWorkItemsFilters {
  status: VatWorkItemStatus | ''
  year: string
  period_type: VatPeriodTypeFilter | ''
  clientSearch: string
  clientSearchName: string
}

export type VatWorkItemAction = 'materialsComplete' | 'readyForReview' | 'sendBack'

export interface VatInvoiceRowProps {
  inv: VatInvoiceResponse
  sectionType: 'income' | 'expense'
  accentBorder: string
  canEdit: boolean
  editingAny: boolean
  onEdit: () => void
  onDelete: () => void
}

export interface VatHistoryTabProps {
  workItemId: number
}

export interface VatExportButtonsProps {
  clientId: number
  period?: string
  year?: number
}

export interface VatCategoryTableProps {
  rows: ExpenseCategoryRow[]
  totalExpenseNet: number
  totalGrossVat: number
  totalInputVat: number
}

export interface VatFiledBannerProps {
  filedAt: string
  filedByName?: string | null
  filedBy?: number | null
  filingMethod?: string | null
  submissionReference?: string | null
  isAmendment?: boolean
  amendsItemId?: number | null
}

export interface VatClientSummaryPanelProps {
  clientId: number
}

export interface VatInvoiceTabProps {
  invoiceType: 'income' | 'expense'
  workItemId: number
  workItem: VatWorkItemResponse
  invoices: VatInvoiceResponse[]
  isFilingPending?: boolean
}

export interface VatActionButtonsProps {
  workItem: VatWorkItemResponse
  isAdvisor: boolean
  isLoading: boolean
  onMaterialsComplete: () => void
  onReadyForReview: () => void
  onFile: () => void
  onSendBack: () => void
}

export interface VatSendBackFormProps {
  onCancel: () => void
  onSubmit: (note: string) => Promise<void>
  loading: boolean
}

export interface VatInvoiceAddFormProps {
  invoiceType: 'income' | 'expense'
  addInvoice: (payload: CreateVatInvoicePayload) => Promise<boolean>
  isAdding: boolean
  onCancel?: () => void
}

export interface VatInvoiceEditRowProps {
  invoice: VatInvoiceResponse
  sectionType: 'income' | 'expense'
  accentBorder: string
  onSave: (payload: UpdateVatInvoicePayload) => Promise<boolean>
  onCancel: () => void
  isSaving: boolean
}

export interface VatProgressBarProps {
  currentStatus: string
}

export interface VatSummaryTabProps {
  workItem: VatWorkItemResponse
  invoices: VatInvoiceResponse[]
}

export interface VatInvoiceTableProps {
  invoices: VatInvoiceResponse[]
  canEdit: boolean
  workItemId: number
  sectionType: 'income' | 'expense'
  emptyMessage?: string
}

export interface VatWorkItemRowActionsProps {
  item: VatWorkItemListItem
  isLoading: boolean
  isDisabled: boolean
  runAction: (itemId: number, action: VatWorkItemAction) => Promise<void>
}

export interface VatWorkItemsCreateModalProps {
  open: boolean
  createError: string | null
  createLoading: boolean
  onClose: () => void
  onSubmit: (payload: CreateVatWorkItemPayload) => Promise<boolean>
  initialClientId?: number
  initialPeriod?: string
}

export interface VatWorkItemsFiltersCardProps {
  filters: Pick<VatWorkItemsFilters, 'status' | 'year' | 'period_type' | 'clientSearch' | 'clientSearchName'>
  onClear: () => void
  onFilterChange: (key: string, value: string) => void
  onMultiFilterChange?: (updates: Record<string, string>) => void
}

export interface VatWorkItemSummaryBarProps {
  workItem: VatWorkItemResponse
  onFilingPendingChange?: (isPending: boolean) => void
}

export interface ColumnOpts {
  isLoading: boolean
  isDisabled: boolean
  duplicateClientIds?: Set<number>
  runAction: (itemId: number, action: VatWorkItemAction) => Promise<void>
}
