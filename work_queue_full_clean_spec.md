# אפיון מלא — Work Queue + Manual Tasks

## 0. מטרת המסמך

מסמך זה מגדיר את התוצר הסופי הרצוי למסך **עבודה לטיפול** ואת כללי הביצוע הנקיים הנדרשים.

המסמך לא מכתיב איך לכתוב כל פונקציה או איך לשנות כל מודל.  
הוא מגדיר מה המערכת צריכה לעשות, מה אסור לשבור, מה נדרש מה־API, מה נדרש מה־UI, ואילו סיכונים חייבים להיסגר.

המטרה: ביצוע נקי, יעיל, בלי כפילויות, בלי שני מקורות אמת, ובלי פעולות מסוכנות שמייצרות חוסר עקביות.

---

## 1. החלטה ארכיטקטונית מרכזית

`Work Queue` הוא **projection מחושב** של עבודה פתוחה במערכת.

הוא אינו מקור אמת.

מקורות האמת נשארים בדומיינים המקוריים:

```txt
tasks
vat_work_items
annual_reports
advance_payments
charges
binders
```

המסך משלב בין:

```txt
System Work Items
+
Manual Tasks
```

אבל לא מאחד את כל הפריטים לטבלת `tasks`.

הכלל החשוב ביותר:

```txt
משלבים במסך אחד.
לא מאחדים לטבלה אחת.
```

---

## 2. למה לא להפוך הכול ל־Task

אסור ליצור Task אוטומטי לכל פריט מערכת.

דוגמה רעה:

```txt
VatWorkItem פתוח
+
Task אוטומטי פתוח עבור אותו VatWorkItem
```

זה יוצר שני מקורות אמת:

```txt
vat_work_items.status
tasks.status
```

ואז נוצרים באגים:

```txt
דוח מע״מ סומן FILED אבל המשימה עדיין OPEN
משימה סומנה DONE אבל דוח המע״מ עדיין OPEN
source נמחק אבל task נשארת בלי משמעות
משתמשים לא יודעים איזה סטטוס נכון
```

המודל הנכון:

```txt
הדומיין המקורי מחזיק את האמת.
Work Queue רק מציג את זה כעבודה לטיפול.
Manual Task היא שכבת עבודה אנושית מעל source, לא תחליף ל-source.
```

---

## 3. תוצר סופי רצוי

מסך אחד בשם:

```txt
עבודה לטיפול
```

המסך מציג את כל הפריטים שדורשים פעולה:

```txt
דוחות מע״מ
דוחות שנתיים
מקדמות
חיובים
קלסרים
משימות ידניות
```

המשתמש צריך להבין מהר:

```txt
מה צריך לעשות
לאיזה לקוח זה שייך
כמה זה דחוף
מה הסטטוס
האם יש משימה קשורה
מה הפעולה הבאה
```

---

## 4. מקורות הפריטים

### 4.1 מע״מ

מקור אמת:

```txt
vat_work_items
```

פריט נכנס ל־Work Queue כאשר הוא דורש טיפול ולא נמצא בסטטוס סופי.

דגשים:

```txt
לא להכניס VAT work item שבוטל / הועבר לארכיון / הוגש
לא להסתמך רק על period אם קיימת due_date/effective_due_date רלוונטית
לא לחשוף פעולת file מהירה אם היא דורשת payload/readiness/override
```

פעולה בטוחה בשלב מלא:

```txt
פתיחה למסך המקור
פעולות ביניים בטוחות אם קיימות ומוגנות
```

פעולות רגישות:

```txt
file VAT
```

תוצג רק אם:
- endpoint קיים בפועל
- payload ברור
- הרשאות סגורות
- readiness סגור
- double click מוגן
- confirm ברור
- טיפול שגיאות ברור

---

### 4.2 דוח שנתי

מקור אמת:

```txt
annual_reports
```

פריט נכנס כאשר הדוח פעיל, לא סופי, ומתקרב לדדליין או באיחור.

סטטוסים סופיים צריכים להיות מוגדרים במפורש.

דגשים:

```txt
SUBMITTED לא אמור להופיע כעבודה רגילה אם אין פעולה המשכית ברורה
ASSESSMENT_ISSUED / OBJECTION_FILED צריכים להופיע רק אם מוגדרת להם משמעות תפעולית
submit דוח שנתי אינו כפתור מהיר פשוט אם יש readiness ודומיין מורכב
```

---

### 4.3 מקדמות

מקור אמת:

```txt
advance_payments
```

נכנס כאשר:

```txt
status = pending / partial
due_date רלוונטי
```

דגשים:

```txt
אם אין endpoint mark-paid ישיר — לא להמציא אחד בפרונט
אם endpoint הוא client-scoped ודורש payload — action חייב לשקף את זה
פתיחה למסך המקור בטוחה יותר מפעולת mark paid מהירה
```

---

### 4.4 חיובים

מקור אמת:

```txt
charges
```

נכנס כאשר חיוב לא שולם ועבר סף איחור.

דגשים:

```txt
mark-paid יכול להיות פעולה מתאימה, אבל רק עם הרשאה, confirm, lock מפני double click, ו־invalidate
```

---

### 4.5 קלסרים

מקור אמת:

```txt
binders
```

נכנס כאשר קלסר מוכן לאיסוף וממתין מעל סף מוגדר.

דגשים:

```txt
return/mark returned לא פעולה טריוויאלית אם נדרש שם מוסר/אוסף או מידע נוסף
אם יש default מהמשתמש המחובר — עדיין צריך confirm ברור
```

---

### 4.6 משימות ידניות

מקור אמת:

```txt
tasks
```

נכנסות כאשר:

```txt
status = open / in_progress
deleted_at IS NULL
```

למשימה ידנית יש lifecycle עצמאי:

```txt
open → in_progress → done / canceled
```

פעולות חובה:

```txt
פתיחה
עריכה
התחלה
השלמה
ביטול
מחיקה רק אם קיימת ומורשית
```

המלצה:

```txt
במערכת תפעולית עדיף cancel על פני hard delete.
```

---

## 5. שמות source type ונרמול

הקוד הקיים עשוי להשתמש בשמות כמו:

```txt
vat_filing
unpaid_charge
stale_binder
task
annual_report
advance_payment
```

האפיון המקורי הציע שמות כמו:

```txt
vat_work_item
charge
binder
```

החלטת ביצוע נקייה:

```txt
לא לעשות migration לשמות DB אם לא חייבים.
לא לשנות שדות קיימים רק בשביל שם יפה.
לבצע נרמול בשכבת service/schema.
```

אפשרות מומלצת:

```txt
להשאיר את source_domain הקיים ב־DB.
להחזיר source_type יציב ב־API.
לתעד mapping במקום אחד.
```

דוגמה:

```txt
source_domain: vat_filing → source_type: vat_filing
source_domain: unpaid_charge → source_type: unpaid_charge
source_domain: stale_binder → source_type: stale_binder
```

או להחזיר שמות חדשים, אבל רק אם כל הפרונט והבדיקות עוברים יחד.

הכלל:

```txt
בחרו חוזה אחד.
אל תערבבו שמות.
אל תשאירו if/else מפוזרים בפרונט.
```

---

## 6. חוזה API רצוי

כל שורה במסך היא `WorkQueueItem`.

מבנה רצוי:

```ts
type WorkQueueItem = {
  id: string
  source_type: string
  source_id: number

  title: string
  description?: string

  type_label: string
  status_label: string

  client_record_id?: number
  client_name?: string
  office_client_number?: string

  due_date?: string
  urgency: 'overdue' | 'approaching' | 'important' | 'upcoming'

  source_summary?: {
    source_type: string
    source_id: number
    label: string
    route?: string
  }

  linked_tasks?: LinkedTaskSummary[]
  linked_tasks_count: number

  warnings?: WorkQueueWarning[]

  available_actions: WorkQueueAction[]

  metadata?: Record<string, unknown>
}
```

משימה מקושרת:

```ts
type LinkedTaskSummary = {
  id: number
  title: string
  status: 'open' | 'in_progress' | 'done' | 'canceled'
  due_date?: string
  priority?: string
  assigned_user_id?: number
  assigned_role?: string
}
```

אזהרה:

```ts
type WorkQueueWarning = {
  key: string
  label: string
  severity: 'info' | 'warning' | 'danger'
}
```

פעולה:

```ts
type WorkQueueAction = {
  key: string
  label: string
  type: 'link' | 'mutation'

  route?: string

  endpoint?: string
  method?: 'POST' | 'PATCH' | 'DELETE'
  payload_schema?: 'none' | 'simple' | 'requires_input'

  confirm?: boolean
  confirm_title?: string
  confirm_message?: string

  variant?: 'primary' | 'secondary' | 'danger'

  disabled?: boolean
  disabled_reason?: string
}
```

דגשים:

```txt
הפרונט לא מנחש פעולות לפי source_type.
הבקאנד מחזיר available_actions לפי מצב, הרשאה, ודומיין.
אם פעולה לא בטוחה או לא קיימת — לא להחזיר אותה.
```

---

## 7. מזהה שורה

מזהה יציב:

```txt
{source_type}:{source_id}
```

דוגמאות:

```txt
vat_filing:123
task:55
unpaid_charge:99
stale_binder:77
```

במקרה של merge בין source לבין task:

```txt
מזהה השורה נשאר של ה-source.
```

לא של ה־task.

---

## 8. Merge בין System Item לבין Manual Task

### 8.1 הבעיה

משתמש יוצר משימה ידנית על source לפני שה־source נכנס ל־Work Queue.

אחרי כמה ימים ה־source עצמו נכנס.

בלי merge יופיעו שתי שורות:

```txt
משימה: לטפל בדוח מע״מ מרץ
דוח מע״מ: דוח מע״מ מרץ טרם הוגש
```

זה לא טוב.

### 8.2 הכלל

אם יש system item ויש task פתוחה/בתהליך שמקושרת לאותו:

```txt
source_domain/source_type + source_id
```

מציגים שורה אחת בלבד.

השורה היא של ה־source.

המשימה מופיעה בתוך:

```txt
linked_tasks
linked_tasks_count
```

### 8.3 מתי task מופיעה עצמאית

Task מופיעה כשורה עצמאית כאשר:

```txt
אין לה source
או
יש לה source אבל ה-source לא נמצא כרגע ב־Work Queue
או
ה-source כבר טופל אבל task עדיין פתוחה
או
ה-source נמחק/לא נגיש אבל task עדיין פתוחה
```

### 8.4 מיזוג ריבוי משימות

אם יש כמה tasks פתוחות על אותו source:

```txt
עדיין שורה אחת בלבד.
linked_tasks_count מציג את הכמות.
linked_tasks מכיל רשימה קצרה.
```

ה־UI יכול להציג:

```txt
יש 3 משימות קשורות
```

ולאפשר פתיחת רשימת המשימות.

---

## 9. Edge Cases חובה

### 9.1 source בתור + task מקושרת

תוצאה:

```txt
שורה אחת של source + linked task.
```

### 9.2 task מקושרת ל־source שעדיין לא בתור

תוצאה:

```txt
שורת task רגילה עם source_summary.
```

### 9.3 source נכנס לתור אחרי task

תוצאה:

```txt
merge אוטומטי.
אין כפילות.
```

### 9.4 source טופל אבל task עדיין פתוחה

תוצאה:

```txt
task נשארת כשורה עצמאית.
מוצגת אזהרה: הפריט המקושר כבר טופל.
```

לא לסגור task אוטומטית.

### 9.5 task הושלמה אבל source עדיין פתוח

תוצאה:

```txt
source ממשיך להופיע.
task done לא מסתירה source פתוח.
```

### 9.6 source נמחק או לא נמצא

תוצאה:

```txt
task נשארת אם היא פתוחה.
מוצגת אזהרה: הפריט המקושר לא נמצא.
```

פעולות:

```txt
ערוך משימה
בטל משימה
נתק קישור מקור אם קיים
```

### 9.7 source לא נגיש בהרשאות

אם המשתמש רואה את task אבל לא מורשה לראות את source:

```txt
לא לחשוף מידע רגיש על source.
להציג task עם אינדיקציה כללית בלבד.
לא להחזיר open source action.
```

### 9.8 source_type legacy לא מוכר

תוצאה:

```txt
להציג task כמשימה רגילה.
להוסיף warning פנימי/log.
לא להפיל את המסך.
```

### 9.9 action נבנתה אבל הסטטוס השתנה לפני לחיצה

השרת חייב להגן.

תוצאה צפויה:

```txt
409 Conflict או current state ברור.
הפרונט מציג שגיאה ומרענן Work Queue.
```

### 9.10 לחיצה כפולה

כל mutation חייבת הגנה:

```txt
כפתור disabled בזמן פעולה
שרת idempotent או מחזיר תשובה עקבית
invalidate אחרי הצלחה/כישלון רלוונטי
```

### 9.11 pagination

סדר עיבוד חובה:

```txt
collect
normalize
merge
sort
paginate
```

אסור לבצע pagination לפני merge.

### 9.12 counts/cards

ספירות כרטיסים מבוססות על הרשימה אחרי merge.

אם source + task התמזגו:

```txt
נספר כשורה אחת.
```

### 9.13 business_id filter

אם יש פילטר לפי business:

```txt
צריך להחליט מה עושים עם דומיינים שהם client-level.
```

לא להשמיט בטעות VAT/annual/advance אם הם שייכים ללקוח ולא לעסק ספציפי.

### 9.14 לקוח סגור/מוקפא

צריך החלטת מוצר:

```txt
האם להציג פריטי עבודה ללקוח CLOSED?
האם להציג ללקוח FROZEN?
האם לאפשר פעולות?
```

המלצה:

```txt
משימות פתוחות עדיין יוצגו עם badge.
פעולות יצירה חדשות ייחסמו.
פריטי חוב/דדליין יכולים להופיע אם הם עדיין דורשים טיפול.
```

### 9.15 תאריכים ו־timezone

כל חישובי due date לפי:

```txt
Asia/Jerusalem
```

לא UTC נאיבי.

דדליין מיסויי הוא date מקומי.

---

## 10. דחיפות ומיון

ערכי urgency:

```txt
overdue
approaching
important
upcoming
```

כלל בסיס:

```txt
due_date < today → overdue
today עד today+7 → approaching
today+8 עד today+21 → important
מעבר לזה → upcoming
```

במיזוג בין source ל־task:

```txt
הדחיפות היא החמורה מביניהם.
```

סדר חומרה:

```txt
overdue > approaching > important > upcoming
```

מיון ברירת מחדל:

```txt
urgency severity
due_date ASC
IN_PROGRESS before OPEN
priority DESC אם קיים
client_name
```

---

## 11. available_actions — עקרונות

הבקאנד מחזיר פעולות.

הפרונט מרנדר.

אין לוגיקת פעולה מפוזרת בפרונט.

### פעולה מסוג link

```txt
ניווט למסך מקור / משימה.
```

חובה:

```txt
route קיים באמת.
אם אין route — לא להחזיר action.
```

### פעולה מסוג mutation

```txt
פעולה שמשנה state בשרת.
```

חובה:

```txt
endpoint קיים באמת
method נכון
payload ברור
הרשאה ברורה
confirm לפעולה רגישה
loading lock
invalidate אחרי פעולה
טיפול שגיאה
```

### פעולות שלא מחזירים

לא להחזיר action אם:

```txt
endpoint לא קיים
route לא קיים
payload לא ברור
הרשאה לא קיימת
הפעולה מסוכנת מדי למסך תור
הסטטוס הנוכחי לא מאפשר אותה
```

---

## 12. פעולות לפי סוג

### 12.1 Task

פעולות:

```txt
open_task
edit_task
start_task
complete_task
cancel_task
delete_task רק אם קיים ומורשה
```

דגשים:

```txt
start/complete/cancel בטוחות יחסית ל־Work Queue.
צריך confirm ל־complete/cancel.
צריך invalidate גם ל־tasks וגם ל־workQueue.
```

אם אין detail/edit route:

```txt
לא להחזיר open/edit כ-route מזויף.
אפשר לפתוח drawer אם זה קיים.
```

---

### 12.2 VAT

פעולות בטוחות:

```txt
open_vat_source
```

פעולות אפשריות רק אם באמת בטוחות:

```txt
materials_complete
ready_for_review
send_back
file
```

דגש:

```txt
file VAT לא פעולה ראשונה למימוש אם היא דורשת payload/readiness/override.
```

---

### 12.3 Annual Report

פעולות בטוחות:

```txt
open_annual_report
```

פעולות רגישות:

```txt
submit
status transition
stage transition
amend
delete
```

לא להציג submit ככפתור מהיר אם אין readiness ברור.

---

### 12.4 Advance Payment

פעולות בטוחות:

```txt
open_advance_payment_context
```

פעולות רגישות:

```txt
mark paid / patch payment
```

אם אין endpoint ישיר:

```txt
לא להמציא action.
אפשר לנווט למסך שבו מטפלים בזה.
```

---

### 12.5 Charge

פעולות:

```txt
open_charge
mark_paid
cancel_charge אם רלוונטי ומורשה
```

דגשים:

```txt
mark_paid מתאים ל־Work Queue רק עם confirm, הרשאה, ו־double click guard.
```

---

### 12.6 Binder

פעולות:

```txt
open_binder
return_binder
revert_ready אם רלוונטי
```

דגשים:

```txt
return דורש confirm ואולי input.
אם נדרש input — action חייב לדעת זאת.
```

---

### 12.7 Create linked task

פעולה:

```txt
create_linked_task
```

תוצאה:

```txt
יוצרת task עם source_domain/source_id.
לא יוצרת שורה כפולה אם ה-source כבר בתור.
```

אם כבר יש task פתוחה על אותו source:

```txt
להציג אזהרה לפני יצירת משימה נוספת.
לא לחסום בהכרח.
```

---

## 13. הרשאות

`available_actions` חייב להיות מחושב לפי הרשאות.

עדיף לא להחזיר פעולה שהמשתמש לא מורשה לבצע.

דוגמאות:

```txt
mark charge paid → לרוב ADVISOR
binder return → ADVISOR/SECRETARY לפי מדיניות
task cancel → יוצר המשימה או ADVISOR
task start → מי שמשויך או בעל הרשאה
```

אם בוחרים להחזיר disabled action:

```txt
חייב disabled_reason ברור.
```

---

## 14. UI נדרש

### 14.1 מבנה המסך

המסך צריך לכלול:

```txt
כותרת והסבר קצר
כרטיסי סיכום
פילטרים
טבלת עבודה
פעולות לכל שורה
אינדיקציה למשימות קשורות
אזהרות edge case
empty/loading/error states
```

### 14.2 עמודות

עמודות מומלצות:

```txt
סוג
לקוח
מה צריך לעשות
תאריך יעד
דחיפות
סטטוס
משימות קשורות
פעולות
```

### 14.3 כרטיסי סיכום

כרטיסים לדוגמה:

```txt
באיחור
דחוף עד 7 ימים
חשוב 8-21 ימים
משימות ידניות
עם משימה קשורה
```

כרטיסים הם גם quick filters.

### 14.4 פילטרים

חובה:

```txt
חיפוש
דחיפות
סוג פריט
לקוח
סטטוס
עם/בלי משימה קשורה
משימות שלי
טווח תאריכים
```

### 14.5 פעולות UI

פעולה ראשית גלויה.

שאר הפעולות בתפריט.

לא להציג 5 כפתורים בשורה.

### 14.6 Confirm

חובה לפעולות:

```txt
complete task
cancel task
delete task
mark paid
file
submit
return binder
```

### 14.7 Loading per action

כאשר פעולה רצה:

```txt
רק הכפתור/שורה הרלוונטיים במצב loading.
לא לנעול את כל המסך אם לא חייבים.
```

### 14.8 Empty state

```txt
אין עבודה פתוחה לטיפול כרגע.
```

### 14.9 Error state

```txt
לא ניתן לטעון את רשימת העבודה.
נסה שוב.
```

---

## 15. יעילות שרת

היישום חייב להיות יעיל.

דגשים:

```txt
לא לבצע N+1 לכל source/task.
לא לשלוף את כל ההיסטוריה אם צריך רק open/in_progress.
לא לחשב actions בפרונט.
לא לבצע pagination לפני merge.
לא לבצע שאילתות source לכל task אחת־אחת אם אפשר batch.
לא להחזיר payload ענק ב־metadata.
```

רצף נכון:

```txt
איסוף ממקורות רלוונטיים
נרמול
טעינת linked tasks ב־batch
בדיקת sources חסרים/סופיים ב־batch ככל האפשר
merge
בניית actions לפי הרשאות
sort
paginate
```

אם כמות גדולה:

```txt
למדוד ביצועים.
לשקול summary query נפרד.
לשקול limits לכל source לפני merge בזהירות בלבד.
```

---

## 16. איכות קוד

דרישות איכות:

```txt
אין duplication של action builders.
אין if/else source_type מפוזר בפרונט.
אין string literals מפוזרים בלי constants/enums.
אין שינוי DB מיותר.
אין endpoint מדומה שלא קיים.
אין פעולה שמחזירה route לא קיים.
אין ערבוב בין label UI לבין ערך enum פנימי.
אין mutation בלי invalidate.
אין optimistic update לפעולה רגישה.
```

המימוש צריך להיות:

```txt
ברור
מדורג לוגית גם אם מבוצע בביצוע אחד
בדיק
ניתן להרחבה
בלי over engineering
```

---

## 17. Observability

להוסיף לוגים/מדדים ברמת service:

```txt
כמה פריטים נאספו מכל source
כמה tasks מקושרות נמצאו
כמה merges בוצעו
כמה שורות אחרי merge
כמה actions נבנו
כמה actions נחסמו בגלל הרשאה/סטטוס
source_type לא מוכר
source חסר ל־linked task
```

לא ללוגג מידע רגיש.

---

## 18. בדיקות חובה

### Backend

חובה לבדוק:

```txt
כל source type נכנס נכון
merge source + linked task
task linked to source not in queue
source final + task open
task done + source open
source deleted + task open
multiple tasks on one source
pagination after merge
counts after merge
available_actions by permissions
unknown source_domain
no N+1 משמעותי אם יש כלי בדיקה
VAT final statuses לא נכנסים
annual submitted לפי החלטה
double click/idempotency
```

### Frontend

חובה לבדוק:

```txt
רינדור כל source type
רינדור linked tasks
רינדור warnings
filters
quick cards
link actions
mutation actions
confirm
loading per action
success invalidate
error toast
empty state
loading state
error state
אין כפילות בין source ו-task
```

---

## 19. החלטות פתוחות שחייבים לסגור לפני/בזמן ביצוע

```txt
מהו חוזה source_type הסופי?
האם נשארים עם source_domain פנימי?
האם annual SUBMITTED מופיע?
מה מדיניות ASSESSMENT_ISSUED / OBJECTION_FILED?
האם task צריכה client_record_id אמיתי?
האם מותר כמה tasks פתוחות לאותו source?
מה עושים עם CLOSED/FROZEN clients?
מה SECRETARY רשאית לראות ולעשות?
אילו domain mutations מותר לבצע ישירות מה־Work Queue?
האם פעולות מסוימות דורשות idempotency key?
מה route המקור לכל source שאין לו detail route ברור?
```

---

# TODO מפורט לביצוע נקי

## A. חוזה ומיפוי

- [ ] להחליט על `source_type` הסופי ב־API.
- [ ] להשאיר DB כפי שהוא אם אין חובה אחרת.
- [ ] למפות `source_domain` פנימי ל־`source_type` חיצוני במקום מרכזי אחד.
- [ ] להגדיר constants/enums לכל source type.
- [ ] להגדיר constants ל־action keys.
- [ ] להגדיר labels במקום מרכזי.
- [ ] להגדיר final statuses לכל דומיין.
- [ ] להגדיר urgency thresholds במקום מרכזי.

## B. Backend — Work Queue Response

- [ ] להרחיב response ל־WorkQueueItem עשיר.
- [ ] להוסיף `id` יציב לכל שורה.
- [ ] להוסיף `title`.
- [ ] להוסיף `description` אם רלוונטי.
- [ ] להוסיף `type_label`.
- [ ] להוסיף `status_label`.
- [ ] להוסיף `source_summary`.
- [ ] להוסיף `linked_tasks`.
- [ ] להוסיף `linked_tasks_count`.
- [ ] להוסיף `warnings`.
- [ ] להוסיף `available_actions`.
- [ ] לשמור תאימות לאחור אם המסך הישן עדיין צורך שדות קיימים.

## C. Backend — איסוף ונרמול

- [ ] לוודא שכל source נאסף לפי תנאי כניסה נכונים.
- [ ] לוודא ש־VAT לא כולל סטטוסים סופיים שאינם FILED.
- [ ] לוודא ש־annual report לא כולל סטטוסים סופיים.
- [ ] להכריע מה עושים עם annual SUBMITTED.
- [ ] לוודא advance payments רק pending/partial.
- [ ] לוודא charges רק issued ורלוונטיים לאיחור.
- [ ] לוודא binders רק ready_for_pickup ורלוונטיים.
- [ ] לוודא tasks רק open/in_progress ולא deleted.
- [ ] לנרמל את כל הפריטים לאותו shape פנימי.

## D. Backend — linked tasks + merge

- [ ] לטעון tasks מקושרות ב־batch.
- [ ] לזהות התאמה לפי `source_domain/source_type + source_id`.
- [ ] לבצע merge לפני pagination.
- [ ] source + task מקושרת = שורה אחת.
- [ ] task ללא source = שורה עצמאית.
- [ ] task עם source שלא בתור = שורה עצמאית.
- [ ] task עם source סופי = שורה עצמאית עם warning.
- [ ] task עם source חסר = שורה עצמאית עם warning.
- [ ] כמה tasks על source = שורה אחת עם count/list.
- [ ] לוודא completed/canceled/deleted tasks לא משתתפות ב־merge.
- [ ] לוודא pagination אחרי merge.
- [ ] לוודא counts אחרי merge.

## E. Backend — Actions

- [ ] לבנות action builders מרכזיים.
- [ ] לא לפזר action logic בכמה מקומות.
- [ ] להחזיר link actions רק ל־routes קיימים.
- [ ] להחזיר mutation actions רק ל־endpoints קיימים ובטוחים.
- [ ] task actions: start/complete/cancel.
- [ ] task open/edit רק אם יש route/drawer.
- [ ] charge mark-paid רק אם הרשאות/idempotency/confirm סגורים.
- [ ] binder return רק אם input/confirm סגורים.
- [ ] VAT file רק אם payload/readiness/idempotency סגורים.
- [ ] annual submit רק אם readiness והרשאות סגורים.
- [ ] advance mark-paid רק אם endpoint ברור קיים.
- [ ] לכל action רגיש להגדיר confirm.
- [ ] לכל action שאין הרשאה — לא להחזיר או להחזיר disabled עם סיבה.
- [ ] לוודא שאין action עם endpoint/route לא קיים.

## F. Backend — הרשאות ובטיחות

- [ ] להעביר context של המשתמש לבניית actions.
- [ ] לסנן actions לפי role/permission.
- [ ] לוודא שה־endpoint עצמו עדיין אוכף הרשאות.
- [ ] להגן מפני double click.
- [ ] להחזיר 409/current state כשסטטוס השתנה.
- [ ] לא לחשוף source לא מורשה דרך task.
- [ ] להגדיר מדיניות CLOSED/FROZEN clients.
- [ ] להגדיר idempotency לפעולות רגישות או התנהגות עקבית.

## G. Backend — ביצועים

- [ ] לבדוק שאין N+1.
- [ ] לבצע batch loading ל־linked tasks.
- [ ] לבצע batch source lookup למשימות מקושרות אם צריך.
- [ ] לא להחזיר metadata כבד.
- [ ] למדוד query count אם אפשר.
- [ ] לוודא sort/paginate אחרי merge בלבד.
- [ ] להוסיף logging counts.

## H. Frontend — מסך

- [ ] לעדכן WorkQueuePage לצרוך response חדש.
- [ ] להציג כרטיסי סיכום.
- [ ] להציג פילטרים מלאים.
- [ ] להציג טבלה עם columns מוגדרים.
- [ ] להציג linked tasks.
- [ ] להציג warnings.
- [ ] להציג פעולה ראשית + menu לשאר הפעולות.
- [ ] להציג empty/loading/error states.
- [ ] לוודא RTL תקין.
- [ ] לוודא labels בעברית עקביים.

## I. Frontend — Actions

- [ ] לייצר action runner כללי ל־link/mutation.
- [ ] link action עושה navigate.
- [ ] mutation action שולחת request לפי חוזה.
- [ ] confirm לפי action.confirm.
- [ ] loading per action.
- [ ] disable בזמן פעולה.
- [ ] success toast.
- [ ] error toast.
- [ ] invalidate workQueue אחרי כל mutation.
- [ ] invalidate tasks אחרי task mutation.
- [ ] לא לבצע optimistic update לפעולות רגישות.
- [ ] לא לכתוב if/else מפוזר לפי source type.

## J. Frontend — Filters/Counts

- [ ] quick cards מסננים את הטבלה.
- [ ] search מחפש title/client/office number/task/source label.
- [ ] filter source type.
- [ ] filter urgency.
- [ ] filter status.
- [ ] filter has linked task.
- [ ] filter assigned/me אם קיים.
- [ ] counts מבוססים על data אחרי merge.
- [ ] pagination עובד אחרי merge לפי backend.

## K. בדיקות

- [ ] Backend unit tests.
- [ ] Backend integration tests.
- [ ] Frontend component tests.
- [ ] Mutation action tests.
- [ ] Permission/action tests.
- [ ] Merge/no-duplication tests.
- [ ] Edge case tests.
- [ ] Manual QA לפי HTML checklist.

## L. Definition of Done

- [ ] אין כפילות בין source לבין task מקושרת.
- [ ] כל שורה כוללת פעולות תקינות בלבד.
- [ ] אין action עם route/endpoint לא קיים.
- [ ] פעולות task עובדות ומרעננות Work Queue.
- [ ] פעולות דומיין רגישות קיימות רק אם הן בטוחות.
- [ ] pagination אחרי merge.
- [ ] counts אחרי merge.
- [ ] הרשאות משפיעות על actions.
- [ ] אין N+1 משמעותי.
- [ ] כל edge case קריטי מכוסה.
- [ ] המסך ברור למשתמש.
- [ ] הקוד לא מכיל duplication מיותר.
- [ ] לא בוצעו migrations מיותרות.
- [ ] אין שני מקורות אמת.
