export const TAX_CALENDAR_ENDPOINTS = {
  groups: '/tax-calendar/groups',
  groupItems: (taxCalendarEntryId: number) => `/tax-calendar/groups/${taxCalendarEntryId}/items`,
} as const
