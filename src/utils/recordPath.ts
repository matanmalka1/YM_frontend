/**
 * The path of a sibling record — the same screen, showing a different id.
 *
 * Every obligation detail panel is mounted twice: standalone (`/tax/vat/:id`,
 * `/tax/reports/:reportId`, `/tax/advance-payments/:clientId/:paymentId`) and
 * inside the client tab (`/clients/:clientId/vat/:workItemId`, …). Naming a
 * route to move between records would drop a client-scoped visitor out of that
 * tab, its breadcrumbs and its navigation, so the move is expressed as "this
 * path, last segment swapped" — which is the record being viewed in both mounts.
 *
 * It is deliberately not built from a feature's `backPath` either: on the
 * standalone advance-payments screen that is the *list* path and carries the
 * client id in a different position, so appending an id to it produces a route
 * that does not exist.
 *
 * Takes only the pathname. A caller that must keep the query string passes it
 * separately to `navigate`; most do not, because a record that just changed is
 * shown from its default view.
 */
export const toSiblingRecordPath = (pathname: string, recordId: number | string): string =>
  pathname.replace(/[^/]+\/?$/, String(recordId))
