export const timelineQK = {
  all: ['timeline'] as const,
  clientEvents: (clientId: number, params: object) => ['timeline', 'client', clientId, 'events', params] as const,
} as const
