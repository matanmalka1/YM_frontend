import type { FilterFieldDef } from '@/components/ui/filters/types'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { WORK_QUEUE_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { taskStatusLabels } from '@/features/tasks'
import { WORK_QUEUE_FILTER_PARAM_KEYS, workQueueSourceTypeLabels, workQueueSourceTypeValues } from '../constants'
import { TASK_RELATION_KEY, taskRelationOptions } from './taskRelationFilter'
import { WORK_QUEUE_MESSAGES } from '../messages'

export const WORK_QUEUE_FILTER_FIELDS: FilterFieldDef[] = [
  {
    type: 'search',
    key: WORK_QUEUE_FILTER_PARAM_KEYS.search,
    label: GLOBAL_UI_MESSAGES.common.search,
    placeholder: WORK_QUEUE_SEARCH_PLACEHOLDER,
  },
  {
    type: 'select',
    key: WORK_QUEUE_FILTER_PARAM_KEYS.sourceType,
    label: WORK_QUEUE_MESSAGES.filters.type,
    options: [
      { value: '', label: WORK_QUEUE_MESSAGES.filters.allTypes },
      ...workQueueSourceTypeValues.map((value) => ({ value, label: workQueueSourceTypeLabels[value] })),
    ],
  },
  {
    type: 'select',
    key: WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus,
    label: WORK_QUEUE_MESSAGES.filters.taskStatus,
    options: [
      { value: '', label: WORK_QUEUE_MESSAGES.filters.allTaskStatuses },
      { value: 'open', label: taskStatusLabels.open },
    ],
  },
  {
    type: 'select',
    key: TASK_RELATION_KEY,
    label: WORK_QUEUE_MESSAGES.filters.workType,
    options: taskRelationOptions,
  },
]
