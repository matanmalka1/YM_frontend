/**
 * Visualization token sets — for chart series, category palettes, and format conventions.
 * These are NOT semantic status tokens. Do not use these to express error/warning/success state.
 * For status coloring use SemanticTone from semanticColors.ts.
 */

/**
 * Background color per VAT expense category — used in breakdown charts and pie segments.
 * Keys match ExpenseCategoryKey from features/vatReports/constants.ts.
 */
export const CATEGORY_COLOR_TOKENS: Record<string, string> = {
  office: 'bg-blue-400',
  travel: 'bg-orange-400',
  professional_services: 'bg-purple-400',
  equipment: 'bg-gray-400',
  rent: 'bg-amber-400',
  salary: 'bg-rose-400',
  marketing: 'bg-pink-400',
  vehicle: 'bg-red-300',
  fuel: 'bg-red-500',
  vehicle_maintenance: 'bg-red-400',
  vehicle_insurance: 'bg-slate-500',
  vehicle_leasing: 'bg-rose-500',
  tolls_and_parking: 'bg-amber-500',
  entertainment: 'bg-yellow-400',
  gifts: 'bg-lime-400',
  communication: 'bg-cyan-500',
  insurance: 'bg-indigo-400',
  maintenance: 'bg-teal-500',
  municipal_tax: 'bg-zinc-500',
  utilities: 'bg-sky-500',
  postage_and_shipping: 'bg-emerald-500',
  bank_fees: 'bg-violet-500',
  mixed_expense: 'bg-orange-500',
}

/**
 * Accent color for the deductible-VAT column in the category breakdown table.
 * Orange is the intentional visual identity for "deductible amount" in this table —
 * not a status, not a warning.
 */
export const VAT_DEDUCTIBLE_ACCENT = 'text-orange-700'

/**
 * Icon colors for file-format export buttons.
 * These follow universal format conventions (Excel = green, PDF = red),
 * not application status semantics.
 */
export const FILE_FORMAT_COLORS = {
  excel: 'text-green-600',
  pdf: 'text-red-500',
} as const
