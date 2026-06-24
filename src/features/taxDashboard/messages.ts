/**
 * Centralized Hebrew UI strings for the taxDashboard feature. Cross-cutting strings
 * stay in GLOBAL_UI_MESSAGES; everything here is tax-dashboard-domain copy.
 * Grouped by area.
 */
export const TAX_DASHBOARD_MESSAGES = {
  page: {
    title: 'לוח מסים',
    description: (year: number) => `סקירת הגשות ומועדים לשנת ${year}`,
    loadingMessage: 'טוען לוח מסים...',
  },
} as const
