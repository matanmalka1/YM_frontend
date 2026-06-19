import type { AuthorityContactFormValues } from './schemas'
import { PAGE_SIZE_LG } from '@/constants/pagination.constants'

export const AUTHORITY_CONTACTS_LIST_PARAMS = {
  page: 1,
  page_size: PAGE_SIZE_LG,
} as const

export const AUTHORITY_CONTACT_TEXT = {
  cardTitle: 'אנשי קשר ברשויות',
  defaultSubtitle: 'גורמי קשר ממשלתיים ורגולטוריים',
  totalSuffix: 'אנשי קשר',
  addButton: 'הוסף',
  loading: 'טוען אנשי קשר...',
  empty: 'לא נוספו עדיין אנשי קשר ברשויות',
  paginationLabel: 'אנשי קשר',
  createTitle: 'הוספת איש קשר',
  editTitle: 'עריכת איש קשר',
  createSubmit: 'הוסף',
  editSubmit: 'עדכן',
  saving: 'שומר...',
  cancel: 'ביטול',
  deleteTitle: 'מחיקת איש קשר',
  deleteMessage: 'האם למחוק את איש הקשר? פעולה זו אינה הפיכה.',
  deleteConfirm: 'מחק',
  createSuccess: 'איש קשר נוצר בהצלחה',
  updateSuccess: 'איש קשר עודכן בהצלחה',
  deleteSuccess: 'איש קשר נמחק בהצלחה',
  loadError: 'שגיאה בטעינת אנשי קשר',
  saveError: 'שגיאה בשמירת איש קשר',
  deleteError: 'שגיאה במחיקת איש קשר',
} as const

export const AUTHORITY_CONTACT_FIELD_LABELS = {
  contactType: 'סוג גורם *',
  name: 'שם *',
  office: 'משרד / סניף',
  phone: 'טלפון',
  email: 'אימייל',
  notes: 'הערות',
} as const

export const AUTHORITY_CONTACT_PLACEHOLDERS = {
  assessing_officer: {
    name: 'לדוגמה: פקיד שומה אילת',
    office: 'לדוגמה: אילת',
  },
  vat_branch: {
    name: 'לדוגמה: מע"מ אילת',
    office: 'לדוגמה: אילת',
  },
  national_insurance: {
    name: 'לדוגמה: ביטוח לאומי אילת',
    office: 'לדוגמה: אילת',
  },
  other: {
    name: 'לדוגמה: רשות / גורם מטפל',
    office: 'לדוגמה: מחוז דרום',
  },
} as const satisfies Record<AuthorityContactFormValues['contact_type'], { name: string; office: string }>

export const AUTHORITY_CONTACT_STATIC_PLACEHOLDERS = {
  phone: 'לדוגמה: 08-1234567',
  email: 'לדוגמה: office@example.gov.il',
  notes: 'הערות פנימיות לצוות',
} as const
