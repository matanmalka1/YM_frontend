/**
 * Canonical search-input placeholders.
 *
 * One entry per distinct search capability so wording stays consistent across
 * pages. Do not inline placeholder strings in components — add or reuse a
 * constant here. If an input searches more than one thing, its placeholder must
 * name what it actually filters on (do not reuse a narrower constant).
 */

/** Client search by name + tax id (ת.ז. / ח.פ.). The default client-search experience. */
export const CLIENT_SEARCH_PLACEHOLDER = 'חיפוש לפי שם, ת.ז. / ח.פ.'

/** Client search that also matches contact details (used in the client sidebar). */
export const CLIENT_SEARCH_WITH_CONTACT_PLACEHOLDER = 'חיפוש לפי שם, ת.ז. / ח.פ. או פרטי קשר'

/** Work-queue search across client, number, title and task. */
export const WORK_QUEUE_SEARCH_PLACEHOLDER = 'חיפוש לפי לקוח, מספר, כותרת או משימה'

/** Binder search by binder number. */
export const BINDER_NUMBER_SEARCH_PLACEHOLDER = 'חיפוש לפי מספר קלסר'

/** Document search by file name and document type. */
export const DOCUMENT_SEARCH_PLACEHOLDER = 'חיפוש לפי שם קובץ או סוג מסמך'

/** User search by name or email address. */
export const USER_SEARCH_PLACEHOLDER = 'חיפוש לפי שם או כתובת מייל'

/** Global free-text search (client name, binder number, file name). */
export const GLOBAL_SEARCH_PLACEHOLDER = 'חיפוש חופשי — שם לקוח, מספר קלסר, שם קובץ'

/** Timeline search across description, binder, charge and document. */
export const TIMELINE_SEARCH_PLACEHOLDER = 'חיפוש לפי תיאור, קלסר, חיוב או מסמך'
