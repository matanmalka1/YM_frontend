# אפיון מלא — מסך עבודה לטיפול + שילוב משימות ידניות

## 1. מטרת המסך

מסך **עבודה לטיפול** הוא מרכז העבודה התפעולי של המשרד.

המטרה שלו היא להציג במקום אחד את כל הדברים שדורשים פעולה, בלי שהמשתמש יצטרך לעבור בין מודולים שונים כדי להבין מה פתוח, מה דחוף, ומה הפעולה הבאה.

המסך מרכז גם פריטי מערכת שנגזרים אוטומטית מהדאטה, וגם משימות ידניות שנוצרו על ידי משתמש.

העיקרון המרכזי:

```txt
משלבים במסך אחד.
לא מאחדים את כל הדומיינים לטבלת tasks.
```

כלומר, `Work Queue` הוא **projection מחושב**, לא מקור אמת.

מקורות האמת נשארים בדומיינים המקוריים:

```txt
tasks
vat_work_items
annual_reports
advance_payments
charges
binders
```

---

## 2. הגדרת המונחים

### 2.1 Work Queue

רשימה מאוחדת של פריטים שדורשים פעולה.

הרשימה נבנית בזמן אמת או כמעט בזמן אמת מתוך הדומיינים הקיימים.

היא לא מחייבת טבלה פיזית.

היא יכולה להיות response של endpoint:

```txt
GET /api/v1/work-queue
```

### 2.2 System Work Item

פריט שהמערכת מזהה אוטומטית מתוך מצב קיים בדאטה.

דוגמאות:

```txt
דוח מע״מ שלא הוגש
דוח שנתי שמתקרב לדדליין
מקדמה פתוחה
חיוב שלא שולם
קלסר שממתין לאיסוף
```

הפריט לא נוצר ידנית.

הוא מופיע כי הוא עומד בתנאי עסקי.

### 2.3 Manual Task

משימה שהמשתמש יצר ידנית.

דוגמאות:

```txt
להתקשר ללקוח
לבקש מסמך
לבדוק חריגה
להכין תשובה
```

משימה ידנית מגיעה מטבלת `tasks`.

יש לה lifecycle עצמאי:

```txt
OPEN → IN_PROGRESS → DONE / CANCELED
```

### 2.4 Linked Manual Task

משימה ידנית שמקושרת לפריט מקור.

לדוגמה:

```txt
Task #55 קשורה ל־VatWorkItem #123
```

השדות הרלוונטיים:

```txt
source_domain
source_id
action_key
action_payload
```

או בשם אחיד מומלץ:

```txt
source_type
source_id
```

---

## 3. החלטת ארכיטקטורה

### 3.1 מה לא עושים

לא יוצרים Task אוטומטי לכל פריט מערכת.

לא עושים sync כפול בין `tasks.status` לבין סטטוס הדומיין המקורי.

לא יוצרים שני מקורות אמת.

דוגמה אסורה:

```txt
VatWorkItem פתוח
+
Task אוטומטי פתוח עבור אותו VatWorkItem
```

זה יוצר בעיית sync:

```txt
vat_work_items.status = FILED
tasks.status = OPEN
```

או להפך:

```txt
tasks.status = DONE
vat_work_items.status = OPEN
```

שני המצבים שגויים.

### 3.2 מה כן עושים

הדומיין המקורי הוא מקור האמת.

`WorkQueueService` אוסף את הפריטים, מנרמל אותם למבנה אחיד, מוסיף פעולות אפשריות, ומחזיר אותם לפרונט.

משימות ידניות הן עוד מקור אחד בתוך התור.

אם משימה ידנית מקושרת לפריט מקור שכבר מופיע בתור, מבצעים merge ומציגים שורה אחת.

---

## 4. מקורות הפריטים במסך

### 4.1 דוחות מע״מ

מקור:

```txt
vat_work_items
```

תנאי כניסה בסיסיים:

```txt
status != FILED
deleted_at IS NULL
period/due_date רלוונטיים לטיפול
```

התנהגות:

דוח מע״מ מופיע כאשר הוא דורש טיפול.

אם הוא סומן כהוגש, הוא נעלם מהתור.

### 4.2 דוחות שנתיים

מקור:

```txt
annual_reports
```

תנאי כניסה בסיסיים:

```txt
filing_deadline <= today + work_queue_window_days
status NOT IN final statuses
deleted_at IS NULL
```

סטטוסים סופיים לדוגמה:

```txt
CLOSED
CANCELED
ACCEPTED
```

הערה:

אם יש לכם סטטוס `SUBMITTED`, צריך להחליט מוצרית אם הוא עדיין דורש טיפול.

מומלץ:

```txt
SUBMITTED = לא מופיע בתור רגיל
ASSESSMENT_ISSUED / OBJECTION_FILED = מופיע רק אם יש פעולה המשכית מוגדרת
```

### 4.3 מקדמות מס הכנסה

מקור:

```txt
advance_payments
```

תנאי כניסה:

```txt
status IN (PENDING, PARTIAL)
due_date <= today + work_queue_window_days
deleted_at IS NULL
```

אם המקדמה שולמה במלואה, היא נעלמת מהתור.

### 4.4 חיובים שלא שולמו

מקור:

```txt
charges
```

תנאי כניסה:

```txt
status = ISSUED
issued_at <= today - unpaid_charge_late_days
deleted_at IS NULL
```

ברירת מחדל:

```txt
unpaid_charge_late_days = 30
```

אם חיוב סומן כמשולם, הוא נעלם מהתור.

### 4.5 קלסרים שממתינים לאיסוף

מקור:

```txt
binders
```

תנאי כניסה:

```txt
status = READY_FOR_PICKUP
ready_for_pickup_at <= today - binder_pickup_wait_days
deleted_at IS NULL
```

ברירת מחדל:

```txt
binder_pickup_wait_days = 30
```

אם קלסר סומן כהוחזר, הוא נעלם מהתור.

### 4.6 משימות ידניות

מקור:

```txt
tasks
```

תנאי כניסה:

```txt
status IN (OPEN, IN_PROGRESS)
deleted_at IS NULL
```

משימות בסטטוס `DONE` או `CANCELED` לא מופיעות.

---

## 5. מבנה ה־API Response

### 5.1 WorkQueueItem

מבנה מומלץ:

```ts
type WorkQueueItem = {
  id: string

  source_type:
    | 'vat_work_item'
    | 'annual_report'
    | 'advance_payment'
    | 'charge'
    | 'binder'
    | 'task'

  source_id: number

  client_record_id?: number
  client_name?: string
  office_client_number?: string

  title: string
  description?: string

  type_label: string
  status_label: string

  due_date?: string
  urgency: 'overdue' | 'approaching' | 'important' | 'upcoming'

  is_manual_task: boolean
  is_system_item: boolean

  linked_task?: LinkedTaskSummary
  source_summary?: SourceSummary

  available_actions: WorkQueueAction[]

  metadata?: Record<string, unknown>
}
```

### 5.2 LinkedTaskSummary

```ts
type LinkedTaskSummary = {
  id: number
  title: string
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  due_date?: string
  assigned_role?: string
  assigned_user_id?: number
}
```

### 5.3 SourceSummary

```ts
type SourceSummary = {
  source_type: string
  source_id: number
  label: string
  route?: string
}
```

### 5.4 WorkQueueAction

```ts
type WorkQueueAction = {
  key: string
  label: string
  type: 'link' | 'mutation'

  route?: string

  endpoint?: string
  method?: 'POST' | 'PATCH' | 'DELETE'

  confirm?: boolean
  confirm_title?: string
  confirm_message?: string

  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  disabled_reason?: string
}
```

---

## 6. מזהה שורה

`id` של שורת Work Queue צריך להיות יציב וברור.

מומלץ:

```txt
{source_type}:{source_id}
```

דוגמאות:

```txt
vat_work_item:123
task:55
charge:99
```

במקרה של merge בין system item למשימה ידנית, מזהה השורה צריך להישאר של המקור הדומייני:

```txt
vat_work_item:123
```

לא:

```txt
task:55
```

כי המקור הדומייני הוא מקור האמת.

---

## 7. חישוב דחיפות

### 7.1 ערכי urgency

```txt
overdue
approaching
important
upcoming
```

### 7.2 כלל בסיסי

```txt
due_date < today → overdue
today <= due_date <= today + 7 → approaching
today + 8 <= due_date <= today + 21 → important
due_date > today + 21 → upcoming
```

### 7.3 פריטים בלי due_date

למשימות ידניות בלי תאריך יעד:

```txt
urgency = upcoming
```

או אם רוצים לדחוף אותן נמוך יותר:

```txt
urgency = upcoming
sort_priority נמוך
```

לחיובים באיחור אפשר להשתמש ב־`issued_at + 30 days` כ־due_date מחושב.

לקלסרים אפשר להשתמש ב־`ready_for_pickup_at + 30 days` כ־due_date מחושב.

### 7.4 מיזוג דחיפות

אם יש system item ומשימה ידנית מקושרת אליו, מחשבים דחיפות לפי החמור מביניהם.

סדר חומרה:

```txt
overdue > approaching > important > upcoming
```

דוגמה:

```txt
VatWorkItem due_date בעוד 10 ימים → important
Linked Task due_date אתמול → overdue
השורה המאוחדת → overdue
```

---

## 8. פעולות לפי סוג פריט

הבקאנד מחזיר `available_actions`.

הפרונט לא מנחש לפי `source_type`.

### 8.1 פעולות משימה ידנית

למשימה ידנית עצמאית:

```ts
available_actions: [
  {
    key: 'open_task',
    label: 'פתח משימה',
    type: 'link',
    route: '/tasks/55'
  },
  {
    key: 'edit_task',
    label: 'ערוך משימה',
    type: 'link',
    route: '/tasks/55/edit'
  },
  {
    key: 'start_task',
    label: 'התחל משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/55/start',
    method: 'POST'
  },
  {
    key: 'complete_task',
    label: 'סמן כהושלמה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/55/complete',
    method: 'POST',
    confirm: true
  },
  {
    key: 'cancel_task',
    label: 'בטל משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/55/cancel',
    method: 'POST',
    confirm: true,
    variant: 'danger'
  }
]
```

אם קיימת מחיקה אמיתית:

```ts
{
  key: 'delete_task',
  label: 'מחק משימה',
  type: 'mutation',
  endpoint: '/api/v1/tasks/55',
  method: 'DELETE',
  confirm: true,
  variant: 'danger'
}
```

המלצה:

במערכת תפעולית עדיף `cancel_task` ולא hard delete.

מחיקה אמיתית צריכה להיות רק אם:

```txt
המשימה נוצרה בטעות
אין עליה audit משמעותי
אין צורך בהיסטוריה
```

### 8.2 פעולות דוח מע״מ

```ts
available_actions: [
  {
    key: 'open_vat_work_item',
    label: 'פתח תיק מע״מ',
    type: 'link',
    route: '/vat/work-items/123'
  },
  {
    key: 'mark_vat_filed',
    label: 'סמן כהוגש',
    type: 'mutation',
    endpoint: '/api/v1/vat-work-items/123/mark-filed',
    method: 'POST',
    confirm: true
  },
  {
    key: 'create_linked_task',
    label: 'צור משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/from-source',
    method: 'POST'
  }
]
```

אם כבר יש linked task, לא להציג `create_linked_task`.

במקומה להציג:

```ts
{
  key: 'open_linked_task',
  label: 'פתח משימה קשורה',
  type: 'link',
  route: '/tasks/55'
}
```

### 8.3 פעולות דוח שנתי

```ts
available_actions: [
  {
    key: 'open_annual_report',
    label: 'פתח דוח שנתי',
    type: 'link',
    route: '/annual-reports/88'
  },
  {
    key: 'mark_annual_report_submitted',
    label: 'סמן כהוגש',
    type: 'mutation',
    endpoint: '/api/v1/annual-reports/88/submit',
    method: 'POST',
    confirm: true
  },
  {
    key: 'create_linked_task',
    label: 'צור משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/from-source',
    method: 'POST'
  }
]
```

### 8.4 פעולות מקדמה

```ts
available_actions: [
  {
    key: 'open_advance_payment',
    label: 'פתח מקדמה',
    type: 'link',
    route: '/advance-payments/44'
  },
  {
    key: 'mark_advance_paid',
    label: 'סמן כשולם',
    type: 'mutation',
    endpoint: '/api/v1/advance-payments/44/mark-paid',
    method: 'POST',
    confirm: true
  },
  {
    key: 'create_linked_task',
    label: 'צור משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/from-source',
    method: 'POST'
  }
]
```

### 8.5 פעולות חיוב

```ts
available_actions: [
  {
    key: 'open_charge',
    label: 'פתח חיוב',
    type: 'link',
    route: '/charges/99'
  },
  {
    key: 'mark_charge_paid',
    label: 'סמן כשולם',
    type: 'mutation',
    endpoint: '/api/v1/charges/99/mark-paid',
    method: 'POST',
    confirm: true
  },
  {
    key: 'create_linked_task',
    label: 'צור משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/from-source',
    method: 'POST'
  }
]
```

### 8.6 פעולות קלסר

```ts
available_actions: [
  {
    key: 'open_binder',
    label: 'פתח קלסר',
    type: 'link',
    route: '/binders/77'
  },
  {
    key: 'mark_binder_returned',
    label: 'סמן כהוחזר',
    type: 'mutation',
    endpoint: '/api/v1/binders/77/mark-returned',
    method: 'POST',
    confirm: true
  },
  {
    key: 'create_linked_task',
    label: 'צור משימה',
    type: 'mutation',
    endpoint: '/api/v1/tasks/from-source',
    method: 'POST'
  }
]
```

---

## 9. כלל מיזוג כפילויות

### 9.1 הבעיה

משתמש יכול ליצור משימה ידנית על דוח מע״מ מסוים לפני שהוא נכנס ל־Work Queue.

לדוגמה:

```txt
Task #55:
title = לטפל בדוח מע״מ מרץ 2026
source_type = vat_work_item
source_id = 123
```

באותו זמן `VatWorkItem #123` עדיין לא עומד בתנאי הכניסה לתור.

אחרי כמה ימים הוא כן נכנס לתור.

בלי מיזוג יופיעו שתי שורות:

```txt
משימה ידנית: לטפל בדוח מע״מ מרץ 2026
דוח מע״מ: דוח מע״מ מרץ 2026 טרם הוגש
```

זה לא טוב.

### 9.2 הכלל

אם יש `SystemWorkItem` ויש `ManualTask` פעילה שמקושרת לאותו `source_type + source_id`, מציגים שורה אחת בלבד.

השורה היא שורת המקור הדומייני.

המשימה הידנית מופיעה בתוך `linked_task`.

### 9.3 דוגמה

```ts
{
  id: 'vat_work_item:123',
  source_type: 'vat_work_item',
  source_id: 123,
  title: 'דוח מע״מ מרץ 2026',
  linked_task: {
    id: 55,
    title: 'לטפל בדוח מע״מ מרץ 2026',
    status: 'OPEN'
  },
  available_actions: [
    {
      key: 'open_vat_work_item',
      label: 'פתח תיק מע״מ',
      type: 'link',
      route: '/vat/work-items/123'
    },
    {
      key: 'open_linked_task',
      label: 'פתח משימה קשורה',
      type: 'link',
      route: '/tasks/55'
    },
    {
      key: 'complete_task',
      label: 'סיים משימה',
      type: 'mutation',
      endpoint: '/api/v1/tasks/55/complete',
      method: 'POST',
      confirm: true
    }
  ]
}
```

---

## 10. התנהגות של משימה מקושרת לפי מצב המקור

### 10.1 מקור עדיין לא בתור

אם יש משימה מקושרת למקור, אבל המקור עדיין לא עומד בתנאי Work Queue:

```txt
המשימה מופיעה כשורת task רגילה.
```

אבל רצוי להציג בה אינדיקציה:

```txt
קשורה לדוח מע״מ מרץ 2026
```

### 10.2 מקור נכנס לתור

ברגע שהמקור עומד בתנאי Work Queue:

```txt
השורה מתמזגת לשורה אחת של source.
```

לא מציגים כפילות.

### 10.3 מקור טופל אבל המשימה עדיין פתוחה

דוגמה:

```txt
VatWorkItem סומן FILED
Task עדיין OPEN
```

החלטה מומלצת:

לא לסגור אוטומטית משימה ידנית בלי החלטה מפורשת.

אבל כן להציג אותה כשורת task עצמאית עם אזהרה:

```txt
הפריט המקושר כבר טופל
```

פעולות:

```txt
פתח מקור
סמן משימה כהושלמה
בטל משימה
ערוך משימה
```

אפשרות מתקדמת:

להציע action:

```txt
סגור משימה כי המקור טופל
```

### 10.4 משימה הושלמה אבל המקור עדיין פתוח

דוגמה:

```txt
Task DONE
VatWorkItem עדיין לא FILED
```

המקור עדיין יופיע בתור כ־SystemWorkItem.

אין להסתיר אותו בגלל שהמשימה הסתיימה.

הדומיין המקורי הוא מקור האמת.

### 10.5 מקור נמחק או לא קיים

אם task מקושרת ל־source שנמחק או לא נמצא:

```txt
המשימה עדיין מופיעה אם היא OPEN / IN_PROGRESS.
```

אבל צריך להציג אזהרה:

```txt
הפריט המקושר לא נמצא או נמחק
```

פעולות אפשריות:

```txt
ערוך משימה
נתק קישור
בטל משימה
סמן כהושלמה
```

### 10.6 מקור נסגר/בוטל

אם source עבר למצב סופי שלא דורש טיפול:

```txt
המקור לא מופיע כ־SystemWorkItem.
```

אם יש task פתוחה עליו, היא מופיעה כשורת task עם אזהרה:

```txt
הפריט המקושר כבר במצב סופי
```

---

## 11. ריבוי משימות על אותו מקור

### 11.1 הבעיה

משתמשים יכולים ליצור כמה משימות על אותו source.

דוגמה:

```txt
Task #55 — להתקשר ללקוח
Task #56 — לבקש מסמך
Task #57 — לבדוק סכום
כולן קשורות ל־VatWorkItem #123
```

### 11.2 החלטה מומלצת

לא לחסום ריבוי משימות.

אבל ב־Work Queue לא מציגים 4 שורות.

מציגים שורה אחת של המקור עם:

```ts
linked_tasks_count: 3
primary_linked_task: ...
```

או:

```ts
linked_tasks: [...]
```

מומלץ response:

```ts
linked_tasks: [
  { id: 55, title: 'להתקשר ללקוח', status: 'OPEN' },
  { id: 56, title: 'לבקש מסמך', status: 'OPEN' }
]
```

ב־UI:

```txt
יש 2 משימות קשורות
```

פעולות:

```txt
פתח פריט מקור
צפה במשימות קשורות
צור משימה נוספת
```

### 11.3 בחירת primary task

אם צריך להציג אחת מרכזית:

סדר עדיפות:

```txt
IN_PROGRESS קודם
אחר כך OPEN
אחר כך due_date הקרוב ביותר
אחר כך priority גבוהה יותר
```

---

## 12. יצירת משימה מתוך פריט מערכת

### 12.1 מתי צריך

בכל שורת system item אפשר לאפשר:

```txt
צור משימה
```

דוגמה:

```txt
דוח מע״מ פתוח → צור משימה למזכירה לבקש מסמכים
```

### 12.2 התנהגות

בעת יצירת משימה מתוך source, המשימה תקבל:

```ts
{
  source_type: 'vat_work_item',
  source_id: 123,
  title: 'לטפל בדוח מע״מ מרץ 2026',
  due_date: source.due_date,
  client_record_id: source.client_record_id
}
```

### 12.3 אחרי יצירת המשימה

לא נוצרת שורה חדשה.

השורה הקיימת מתעדכנת ומציגה:

```txt
יש משימה קשורה
```

אם אין source בתור כרגע והמשימה נוצרה ממסך אחר, היא תופיע כמשימה עצמאית עד שהמקור עצמו ייכנס לתור.

---

## 13. עריכת משימה

### 13.1 פעולות עריכה

למשימה ידנית יש לאפשר:

```txt
עריכת כותרת
עריכת תיאור
שינוי תאריך יעד
שינוי עדיפות
שינוי שיוך
שינוי קישור מקור
הסרת קישור מקור
```

### 13.2 עריכת משימה מקושרת

אם משימה מקושרת למקור, העריכה שלה לא משנה את המקור.

דוגמה:

שינוי `task.due_date` לא משנה את `vat_work_item.due_date`.

אלה שני דברים שונים:

```txt
due_date של source = deadline דומייני
due_date של task = יעד עבודה פנימי
```

### 13.3 שינוי קישור מקור

אם המשתמש משנה קישור מקור:

```txt
source_type/source_id מתעדכנים
```

אחרי שמירה:

```txt
Work Queue מחושב מחדש
```

אם הקישור החדש מצביע לפריט שכבר בתור, יתבצע merge.

---

## 14. ביטול ומחיקת משימה

### 14.1 ביטול

ביטול משימה משנה סטטוס:

```txt
CANCELED
```

המשימה לא מופיעה יותר ב־Work Queue.

אם היא הייתה linked task על source פעיל, source ממשיך להופיע.

### 14.2 מחיקה

מחיקה אמיתית מומלצת רק אם יש soft delete:

```txt
deleted_at
deleted_by
```

במקרה כזה:

```txt
deleted task לא מופיעה בתור
לא משתתפת במיזוג
```

### 14.3 המלצה

במסך עבודה לטיפול הפעולה הראשית צריכה להיות:

```txt
בטל משימה
```

לא:

```txt
מחק משימה
```

מחיקה יכולה להישאר במסך פרטי משימה או למשתמש בעל הרשאה גבוהה בלבד.

---

## 15. סגירת פריט מקור והשפעה על משימות

### 15.1 מקור נסגר

אם source טופל:

```txt
VatWorkItem → FILED
Charge → PAID
Binder → RETURNED
AdvancePayment → PAID
AnnualReport → SUBMITTED / CLOSED / ACCEPTED
```

ה־system item נעלם מהתור.

### 15.2 linked task עדיין פתוחה

לא לסגור אוטומטית כברירת מחדל.

סיבה:

המשימה יכולה להיות follow-up שלא הסתיים.

דוגמה:

```txt
דוח מע״מ הוגש
אבל עדיין צריך לשלוח אישור ללקוח
```

לכן המשימה תישאר בתור כמשימה ידנית.

אבל תוצג אזהרה:

```txt
הפריט המקושר כבר טופל
```

### 15.3 אפשרות מתקדמת

בעת פעולה על source אפשר להציג checkbox:

```txt
סמן גם משימות קשורות כהושלמו
```

לא חובה לשלב בשלב ראשון.

---

## 16. הרשאות

### 16.1 הרשאות צפייה

כל משתמש שרואה את מסך עבודה לטיפול רואה רק פריטים שמותרים לו לפי הרשאה.

לדוגמה:

```txt
ADVISOR → רואה הכול
SECRETARY → רואה תפעול, קלסרים, משימות, אולי חיובים לפי החלטה
```

### 16.2 הרשאות פעולה

`available_actions` צריך להיות מחושב לפי הרשאות.

אם למשתמש אין הרשאה לפעולה, עדיף לא להחזיר אותה.

אפשרות שנייה:

להחזיר disabled:

```ts
{
  key: 'mark_charge_paid',
  label: 'סמן כשולם',
  type: 'mutation',
  disabled: true,
  disabled_reason: 'אין הרשאה לסמן חיוב כשולם'
}
```

המלצה:

ב־MVP לא להחזיר פעולות אסורות.

### 16.3 הרשאות דומיין

דוגמאות:

```txt
סימון חיוב כשולם → רק ADVISOR
סימון קלסר כהוחזר → ADVISOR או SECRETARY
התחלת משימה → המשתמש שהוקצה או בעל הרשאה
ביטול משימה → יוצר המשימה או ADVISOR
```

---

## 17. מיון

### 17.1 סדר ברירת מחדל

מיון מומלץ:

```txt
urgency severity DESC
due_date ASC
priority DESC
source_type order
client_name ASC
```

סדר severity:

```txt
overdue
approaching
important
upcoming
```

### 17.2 פריטים בלי due_date

פריטים בלי due_date יופיעו אחרי פריטים עם due_date באותה urgency.

### 17.3 משימות IN_PROGRESS

משימות בתהליך צריכות לקבל boost.

אם יש שתי משימות באותה דחיפות:

```txt
IN_PROGRESS לפני OPEN
```

---

## 18. סינונים

המסך צריך לתמוך בסינון לפי:

```txt
דחיפות
סוג פריט
לקוח
סטטוס
טווח תאריכים
משימות שלי
משימות ללא שיוך
פריטים עם משימה קשורה
פריטים ללא משימה קשורה
```

### 18.1 סוגי פריטים

```txt
מע״מ
דוח שנתי
מקדמה
חיוב
קלסר
משימה ידנית
```

### 18.2 דחיפות

```txt
באיחור
דחוף עד 7 ימים
חשוב 8-21 ימים
קרוב
```

### 18.3 מצב טיפול

מומלץ להוסיף פילטר UI:

```txt
הכול
פריטי מערכת בלבד
משימות ידניות בלבד
פריטים עם משימות קשורות
```

---

## 19. UI מומלץ

### 19.1 מבנה שורה

כל שורה תציג:

```txt
סוג פריט
שם לקוח
מספר לקוח במשרד
כותרת
תיאור קצר
תאריך יעד
דחיפות
סטטוס
אינדיקציה למשימה קשורה
פעולות
```

### 19.2 פעולות בשורה

להציג פעולה ראשית אחת גלויה.

שאר הפעולות תחת menu.

דוגמה:

```txt
[פתח תיק מע״מ] [⋯]
```

בתפריט:

```txt
צור משימה
פתח משימה קשורה
סמן כהוגש
```

### 19.3 לא להעמיס

לא להציג 5 כפתורים בשורה.

המסך צריך להיות עבודה, לא לוח כפתורים.

### 19.4 Empty state

אם אין פריטים:

```txt
אין עבודה פתוחה לטיפול כרגע
```

אפשר להוסיף:

```txt
כל הדוחות, המקדמות, החיובים, הקלסרים והמשימות נמצאים במצב תקין.
```

### 19.5 Loading state

להציג skeleton rows.

### 19.6 Error state

אם endpoint נכשל:

```txt
לא ניתן לטעון את רשימת העבודה
נסה שוב
```

---

## 20. Backend — מבנה שירותים

### 20.1 WorkQueueService

אחריות:

```txt
איסוף פריטים מכל המקורות
נרמול למבנה אחיד
חישוב urgency
בניית פעולות
מיזוג משימות מקושרות
מיון
החזרת response
```

### 20.2 Builders

מומלץ להפריד builders:

```txt
build_vat_work_item_queue_item
build_annual_report_queue_item
build_advance_payment_queue_item
build_charge_queue_item
build_binder_queue_item
build_task_queue_item
```

כל builder אחראי ל:

```txt
title
description
type_label
status_label
due_date
source_summary
available_actions
metadata
```

### 20.3 Action Builders

מומלץ להפריד בניית פעולות:

```txt
build_task_actions
build_vat_actions
build_annual_report_actions
build_advance_payment_actions
build_charge_actions
build_binder_actions
```

פעולות תלויות:

```txt
status
permissions
linked_task exists
domain rules
```

---

## 21. API Endpoints

### 21.1 Work Queue

```txt
GET /api/v1/work-queue
```

Query params אפשריים:

```txt
urgency
source_type
client_record_id
date_from
date_to
assigned_to_me
has_linked_task
page
page_size
```

### 21.2 פעולות קיימות לפי דומיין

משימות:

```txt
POST /api/v1/tasks/{task_id}/start
POST /api/v1/tasks/{task_id}/complete
POST /api/v1/tasks/{task_id}/cancel
PATCH /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
```

מע״מ:

```txt
POST /api/v1/vat-work-items/{id}/mark-filed
```

מקדמות:

```txt
POST /api/v1/advance-payments/{id}/mark-paid
```

חיובים:

```txt
POST /api/v1/charges/{id}/mark-paid
```

קלסרים:

```txt
POST /api/v1/binders/{id}/mark-returned
```

דוחות שנתיים:

```txt
POST /api/v1/annual-reports/{id}/submit
```

### 21.3 יצירת משימה מקושרת

מומלץ:

```txt
POST /api/v1/tasks/from-source
```

Payload:

```ts
{
  source_type: 'vat_work_item',
  source_id: 123,
  title?: string,
  description?: string,
  due_date?: string,
  priority?: string,
  assigned_role?: string,
  assigned_user_id?: number
}
```

השרת צריך:

```txt
לוודא שה־source קיים
להעתיק client_record_id אם רלוונטי
ליצור task עם source_type/source_id
להחזיר task
```

---

## 22. Frontend behavior

### 22.1 Link action

אם:

```ts
type = 'link'
```

לחיצה עושה navigate ל־`route`.

### 22.2 Mutation action

אם:

```ts
type = 'mutation'
```

לחיצה שולחת request ל־`endpoint` עם `method`.

אחרי הצלחה:

```txt
invalidate workQueue query
toast success
סגירת confirm dialog אם היה
```

### 22.3 Confirm

אם:

```ts
confirm = true
```

להציג ConfirmDialog.

אם אין confirm text, להשתמש בברירת מחדל:

```txt
האם לבצע את הפעולה?
```

### 22.4 Error handling

אם mutation נכשל:

```txt
להציג toast error
לא לעדכן UI אופטימית אם הפעולה רגישה
```

### 22.5 Optimistic update

לא חובה בשלב ראשון.

עדיף:

```txt
mutation → success → invalidate
```

פשוט ואמין יותר.

---

## 23. Edge Cases

### 23.1 כפילות בין task ל־source

אם יש task מקושרת ל־source שמופיע בתור:

```txt
להציג שורה אחת
```

### 23.2 task מקושרת ל־source שלא בתור

```txt
להציג כמשימה עצמאית
```

### 23.3 source נכנס לתור אחרי task

```txt
למזג לשורה אחת
```

### 23.4 source טופל אבל task פתוחה

```txt
להציג task עצמאית עם אזהרה
```

### 23.5 task הושלמה אבל source פתוח

```txt
להציג source כרגיל
```

### 23.6 source נמחק

```txt
להציג task עם אזהרה שהמקור לא נמצא
```

### 23.7 כמה tasks על אותו source

```txt
להציג שורת source אחת עם linked_tasks_count
```

### 23.8 כמה users עובדים על אותה משימה

צריך להגן בשרת.

אם משתמש מנסה להתחיל משימה שכבר IN_PROGRESS:

```txt
להחזיר 409 Conflict או להחזיר current state
```

### 23.9 פעולה כפולה

אם משתמש לוחץ פעמיים על `mark_paid`:

```txt
השרת צריך להיות idempotent או להחזיר תשובה ברורה
```

מומלץ:

```txt
אם כבר PAID → להחזיר 200 עם current state
או 409 עם message ברור
```

### 23.10 פריט נעלם אחרי פעולה

אחרי פעולה מוצלחת, הפריט יכול להיעלם מהרשימה.

זה תקין.

צריך להציג toast:

```txt
הפעולה בוצעה בהצלחה
```

### 23.11 הרשאה השתנתה

אם הפעולה הופיעה אבל עד הביצוע ההרשאה השתנתה:

```txt
השרת מחזיר 403
הפרונט מציג הודעה
מבצע invalidate
```

### 23.12 תאריך יעד חסר

משימה בלי due_date עדיין מופיעה.

מיון נמוך יותר.

### 23.13 לקוח נמחק/נסגר

אם client נסגר:

להחליט לפי דומיין.

מומלץ:

```txt
פריטי עבודה לא נוצרים עבור לקוח CLOSED
משימות ידניות פתוחות עדיין מופיעות עם badge "לקוח סגור"
```

### 23.14 לקוח מוקפא

מומלץ:

```txt
פריטי מערכת עדיין יכולים להופיע אם יש חובות/דדליין
אבל פעולות יצירה חדשות חסומות
```

### 23.15 source בלי client_record_id

לא כל פריט חייב לקוח.

משימה כללית יכולה להופיע בלי לקוח.

### 23.16 task עם source_type לא מוכר

להציג task רגילה.

להוסיף אזהרת metadata פנימית ללוג.

### 23.17 action endpoint חסר

לא להחזיר action שהשרת לא תומך בה.

### 23.18 route חסר

אם אין route למסך מקור, לא להחזיר link action.

### 23.19 deleted task linked to source

לא משתתפת במיזוג.

### 23.20 canceled task linked to source

לא משתתפת במיזוג כברירת מחדל.

### 23.21 completed task linked to source

לא משתתפת במיזוג כברירת מחדל.

אפשר להציג בהיסטוריה במסך המקור, לא בתור.

### 23.22 source final with completed tasks

לא מופיע ב־Work Queue.

### 23.23 timezone

כל חישובי due_date צריכים להשתמש ב:

```txt
Asia/Jerusalem
```

לא UTC נאיבי.

### 23.24 date vs datetime

דדליין מיסויי הוא בדרך כלל date, לא datetime.

להשוות לפי date מקומי.

### 23.25 pagination עם merge

חשוב לבצע merge לפני pagination.

אחרת אפשר לקבל כפילויות בין עמודים.

סדר נכון:

```txt
collect
normalize
merge
sort
paginate
```

### 23.26 counts בכרטיסים

ספירות צריכות להתבסס אחרי merge.

אם source + task התמזגו, נספר כשורה אחת.

### 23.27 חיפוש

חיפוש צריך לבדוק:

```txt
title
client_name
office_client_number
type_label
linked_task.title
```

### 23.28 ביצוע פעולה על linked task מתוך source row

אם המשתמש מסמן linked task כהושלמה:

```txt
source row נשארת אם source עדיין דורש טיפול
רק linked_task מוסרת/מתעדכנת
```

### 23.29 ביצוע פעולה על source מתוך merged row

אם המשתמש מסמן source כטופל:

```txt
source row נעלמת
linked task יכולה להופיע עצמאית אם עדיין פתוחה
```

### 23.30 יצירת task כפולה מאותו source

אם כבר יש task פתוחה על אותו source, בלחיצה על "צור משימה":

אפשרויות:

1. לחסום ולהציג:
```txt
כבר קיימת משימה פתוחה לפריט הזה
```

2. לאפשר יצירת משימה נוספת.

המלצה:

לא לחסום. אבל להציג אזהרה:

```txt
כבר קיימת משימה קשורה. ליצור משימה נוספת?
```

---

## 24. Observability ולוגים

יש ללוגג:

```txt
מספר פריטים מכל מקור
מספר פריטים אחרי merge
פעולות שנבנו
source_type לא מוכר
source_id חסר
כשל בבניית פעולה
```

לא ללוגג מידע רגיש מעבר לנדרש.

---

## 25. בדיקות Backend

### 25.1 Unit tests

לבדוק:

```txt
חישוב urgency
בניית action לפי status
merge בין source ל־task
ריבוי tasks על source
source טופל task פתוחה
task הושלמה source פתוח
permissions משפיעות על actions
```

### 25.2 Integration tests

לבדוק:

```txt
GET /work-queue מחזיר כל סוג מקור
אין כפילות בין task ל־source
pagination אחרי merge
filters עובדים
actions קיימות לפי הרשאה
```

### 25.3 Idempotency tests

לבדוק:

```txt
mark paid פעמיים
complete task פעמיים
cancel task פעמיים
mark filed פעמיים
```

---

## 26. בדיקות Frontend

לבדוק:

```txt
רינדור כל source_type
רינדור linked_task
פעולת link עושה navigate
פעולת mutation שולחת request
confirm מוצג כשצריך
invalidate אחרי הצלחה
toast error בכישלון
סינונים
מיון
empty state
loading state
```

---

## 27. Migration / תאימות לאחור

אם כבר קיימים שדות:

```txt
source_domain
source_id
action_key
action_payload
```

אפשר להשאיר אותם.

אבל ב־API החיצוני עדיף לחשוף:

```txt
source_type
source_id
```

אם משנים DB:

```txt
source_domain → source_type
```

או להוסיף alias ברמת schema.

לא לבצע migration גדול אם אין צורך.

---

## 28. MVP מומלץ

שלב ראשון:

```txt
GET /work-queue מחזיר מבנה אחיד
משימות ידניות מוצגות באותו מסך
available_actions קיימות
link actions עובדות
task actions עובדות
merge בסיסי source + task עובד
אין כפילויות
```

שלב שני:

```txt
mutation actions לדומיינים
create linked task
linked_tasks_count
permissions מלאות
advanced filters
```

שלב שלישי:

```txt
action dispatcher אחיד
bulk actions
saved filters
activity history
```

---

## 29. Definition of Done

השינוי גמור כאשר:

1. מסך `עבודה לטיפול` מציג פריטים מכל המקורות הרלוונטיים.

2. משימות ידניות מופיעות באותו מסך.

3. אין יצירת Task אוטומטית עבור כל פריט מערכת.

4. אין כפילות בין task מקושרת לבין source שמופיע בתור.

5. אם source ו־task מקושרים, הם מוצגים כשורה אחת.

6. אם source לא בתור, task מקושרת מופיעה כמשימה רגילה.

7. אם source נכנס לתור בהמשך, מתבצע merge.

8. אם source טופל אבל task פתוחה, task נשארת ומוצגת עם אינדיקציה.

9. אם task הושלמה אבל source עדיין פתוח, source ממשיך להופיע.

10. כל שורה כוללת `available_actions`.

11. הפרונט מרנדר פעולות מה־API ולא מנחש לפי סוג.

12. קיימות פעולות למשימה:
    - פתיחה
    - עריכה
    - התחלה
    - השלמה
    - ביטול
    - מחיקה אם קיימת ומורשית

13. קיימות פעולות source לפחות כניווט למסך המקור.

14. פעולות mutation בסיסיות עובדות איפה שכבר יש endpoint.

15. אחרי כל פעולה יש invalidate ל־work queue.

16. הספירות בכרטיסים מבוססות אחרי merge.

17. pagination מתבצע אחרי merge.

18. הרשאות משפיעות על `available_actions`.

19. אין שני מקורות אמת לאותו מצב תפעולי.

20. המסך מתפקד כ־Command Center אמיתי ולא רק כרשימת קישורים.

---

## 30. כלל מסכם

```txt
Work Queue הוא תצוגת עבודה מאוחדת.
הדומיינים המקוריים הם מקור האמת.
משימות ידניות הן שכבת עבודה אנושית.
מיזוג מתבצע בתצוגה, לא בטבלאות.
```
