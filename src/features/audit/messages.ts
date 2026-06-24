/**
 * Centralized Hebrew UI strings for the audit feature. Cross-cutting strings
 * (loading) stay in GLOBAL_UI_MESSAGES;
 * everything here is audit-domain copy. Grouped by area.
 */
export const AUDIT_MESSAGES = {
  table: {
    columnDate: 'תאריך',
    columnAction: 'פעולה',
    columnDetails: 'פרטים',
    columnPerformedBy: 'בוצע ע"י',
  },
  section: {
    defaultTitle: 'היסטוריית שינויים',
    defaultSubtitle: 'פעולות שבוצעו על הרשומה',
    emptyFiltered: 'אין תוצאות התואמות את הסינון',
    emptyDefault: 'אין היסטוריית שינויים',
  },
} as const
