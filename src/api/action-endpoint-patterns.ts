export const ACTION_ENDPOINT_PATTERNS: RegExp[] = [
  /^\/binders\/\d+\/ready$/,
  /^\/binders\/\d+\/revert-ready$/,
  /^\/binders\/\d+\/return$/,
  /^\/binders\/\d+\/pickup-reminder$/,
  /^\/charges\/\d+\/issue$/,
  /^\/charges\/\d+\/mark-paid$/,
  /^\/charges\/\d+\/cancel$/,
  /^\/clients\/\d+\/businesses\/\d+$/,
  /^\/annual-reports\/\d+\/amend$/,
  /^\/annual-reports\/\d+\/submit$/,
  /^\/annual-reports\/\d+\/client-reminder$/,
] as const
