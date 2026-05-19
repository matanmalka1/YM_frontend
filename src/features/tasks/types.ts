export interface TaskSourceContext {
  source_domain: string
  source_id: number
  title: string
  type_label?: string | null
  client_name?: string | null
  due_date?: string | null
  linked_tasks_count?: number
  linked_tasks?: Array<{ id: number; title: string; status: string }>
}
