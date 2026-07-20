// Lifecycle mutations of a single work item (status transitions and filing) share one key,
// so any component on the page can ask whether the item is mid-transition without the page
// passing a flag down. Invoice mutations are deliberately not tagged: they carry their own
// local pending state and must not blank out the invoice table's edit affordances.
export const vatMutationKeys = {
  lifecycle: (workItemId: number) => ['tax', 'vat-work-items', 'lifecycle', workItemId] as const,
}
