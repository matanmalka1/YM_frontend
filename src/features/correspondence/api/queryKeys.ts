export const correspondenceQK = {
  forClient: (clientId: number) => ['correspondence', 'client', clientId] as const,
} as const
