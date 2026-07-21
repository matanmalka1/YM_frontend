import { describe, expect, it } from 'vitest'
import { buildClientBinderColumns, buildGlobalBinderColumns } from './BindersColumns'

const noop = () => undefined

const buildGlobal = () =>
  buildGlobalBinderColumns({
    actionLoadingId: null,
    onReceiveMaterial: noop,
    onMarkFull: noop,
    onReopenCapacity: noop,
    onMarkReadyForHandover: noop,
    onMarkReadyForHandoverBulk: noop,
    onRevertReadyForHandover: noop,
    onHandoverToClient: noop,
    onHandoverToClientBulk: noop,
    onOpenDetail: noop,
    onDelete: noop,
  })

const BASE_KEYS = ['binder_number', 'location_status', 'capacity_status', 'period_start', 'days_in_office']

describe('buildGlobalBinderColumns', () => {
  it('keeps the pre-refactor global column set and order', () => {
    expect(buildGlobal().map((column) => column.key)).toEqual([
      'office_client_number',
      'client_name',
      'client_id_number',
      ...BASE_KEYS,
      'actions',
    ])
  })
})

describe('buildClientBinderColumns', () => {
  it('renders the shared base columns only — no client-identity columns and no actions', () => {
    expect(buildClientBinderColumns().map((column) => column.key)).toEqual(BASE_KEYS)
  })

  it('shares headers with the global table base columns', () => {
    const globalByKey = new Map(buildGlobal().map((column) => [column.key, column.header]))
    for (const column of buildClientBinderColumns()) {
      expect(column.header).toBe(globalByKey.get(column.key))
    }
  })
})
