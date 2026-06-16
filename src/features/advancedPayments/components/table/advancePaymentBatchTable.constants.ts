const HEADER_BASE_CLASS = 'px-3 py-1.5 text-xs font-semibold text-gray-400 align-middle'

export const ADVANCE_PAYMENT_BATCH_COLUMN_COUNT = 11

export const ADVANCE_PAYMENT_BATCH_TABLE_HEADERS = [
  { label: 'מס׳', className: `${HEADER_BASE_CLASS} px-4 text-right w-16` },
  { label: 'שם לקוח', className: `${HEADER_BASE_CLASS} text-right w-48` },
  { label: 'תקופת מקדמה', className: `${HEADER_BASE_CLASS} text-right w-28` },
  { label: 'תאריך יעד', className: `${HEADER_BASE_CLASS} text-right w-24` },
  { label: 'מחזור מדווח', className: `${HEADER_BASE_CLASS} text-center w-24` },
  { label: 'צפוי', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'שולם', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'יתרה', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'אחוז מקדמה', className: `${HEADER_BASE_CLASS} text-center w-20` },
  { label: 'סטטוס', className: `${HEADER_BASE_CLASS} text-center w-24` },
  { label: '', className: 'px-3 py-1.5 align-middle w-10' },
] as const
