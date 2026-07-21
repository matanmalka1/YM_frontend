export type SigningPageState = 'loading' | 'ready' | 'confirming_approve' | 'confirming_decline' | 'signed' | 'declined' | 'error'

export type SigningTerminalState = Extract<SigningPageState, 'loading' | 'error' | 'signed' | 'declined'>
