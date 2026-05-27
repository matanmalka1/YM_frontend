export const ACTION_ENDPOINT_PATTERNS: RegExp[] = [
  /^\/binders\/\d+\/mark-ready-for-handover$/,
  /^\/binders\/\d+\/revert-ready-for-handover$/,
  /^\/binders\/\d+\/handover-to-client$/,
  /^\/binders\/\d+\/handover-reminder$/,
  /^\/charges\/\d+\/issue$/,
  /^\/charges\/\d+\/mark-paid$/,
  /^\/charges\/\d+\/cancel$/,
  /^\/clients\/\d+\/businesses\/\d+$/,
  /^\/annual-reports\/\d+\/amend$/,
  /^\/annual-reports\/\d+\/submit$/,
  /^\/annual-reports\/\d+\/client-reminder$/,
] as const
