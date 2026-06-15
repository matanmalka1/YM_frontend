import { ListChecks } from 'lucide-react'

export const TasksLoadingState = () => (
  <div className="space-y-2 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm" aria-label="טוען משימות">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-50" />
    ))}
  </div>
)

export const TasksErrorState = () => (
  <div className="rounded-2xl border border-negative-100 bg-negative-50 p-4 text-sm font-semibold text-negative-800">
    שגיאה בטעינת משימות
  </div>
)

export const TasksEmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
    <ListChecks className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
    <p className="mt-3 text-sm font-semibold text-gray-800">
      {hasFilters ? 'אין משימות שמתאימות לסינון' : 'אין משימות'}
    </p>
    <p className="mt-1 text-xs text-gray-500">
      {hasFilters ? 'נסו לשנות את הסינון או לנקות אותו.' : 'אפשר ליצור משימה חדשה ולהתחיל מעקב.'}
    </p>
  </div>
)
