import { describe, expect, it } from 'vitest'
import { buildGlobalBinderColumns } from './BindersColumns'

const noop = () => undefined

const buildGlobal = (includeClientColumns = true) =>
  buildGlobalBinderColumns({
    actionLoadingId: null,
    includeClientColumns,
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

describe('buildGlobalBinderColumns', () => {
  it('keeps the pre-refactor global column set and order', () => {
    expect(buildGlobal().map((column) => column.key)).toEqual([
      'office_client_number',
      'client_name',
      'client_id_number',
      'binder_number',
      'location_status',
      'capacity_status',
      'period_start',
      'days_in_office',
      'actions',
    ])
  })

  it('omits client-identity columns on the client-pinned tab', () => {
    expect(buildGlobal(false).map((column) => column.key)).toEqual([
      'binder_number',
      'location_status',
      'capacity_status',
      'period_start',
      'days_in_office',
      'actions',
    ])
  })
})
