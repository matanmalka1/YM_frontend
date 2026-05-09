import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'
import type { ActionCommand } from '@/lib/actions/types'
import type { AttentionEmptyCheck } from '../api'
import type { PanelItem, PanelSection, AttentionTone } from '../attentionBoardSections'
import { DashboardEmptyState, DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

const ATTENTION_BATCH_SIZE = 5

const toneIcon: Record<AttentionTone, string> = {
  amber: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
}

const tonePill: Record<AttentionTone, string> = {
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
}

interface TaskCardProps {
  item: PanelItem
  tone: AttentionTone
  sectionIcon: LucideIcon
  activeActionKey: string | null
  onAction: (action: ActionCommand) => void
}

const TaskCard = ({ item, tone, sectionIcon: SectionIcon, activeActionKey, onAction }: TaskCardProps) => {
  const action = item.actions?.[0] ?? null
  const { meta } = item
  const badgeTone = meta?.badgeTone ?? tone

  const cardContent = (
    <>
      {/* RIGHT: icon + text */}
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneIcon[tone])}>
          <SectionIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
            <p className="truncate text-sm font-bold text-gray-900">{item.label}</p>
            {meta?.badge && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                  tonePill[badgeTone],
                )}
              >
                {meta.badge}
              </span>
            )}
          </div>
          {item.sublabel && <p className="truncate text-sm text-gray-500">{item.sublabel}</p>}
          {meta?.description && <p className="mt-0.5 truncate text-xs text-slate-400">{meta.description}</p>}
        </div>
      </div>

      {/* LEFT: amount + tag + action */}
      <div className="flex shrink-0 items-center gap-6">
        {meta?.amount && (
          <div className="text-right">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">סכום</p>
            <p className="text-sm font-bold tabular-nums text-gray-900">{meta.amount}</p>
          </div>
        )}
        {meta?.tag && (
          <div className="text-right">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">מועד</p>
            <p className={cn('text-sm font-bold', badgeTone === 'red' ? 'text-red-600' : 'text-gray-900')}>
              {meta.tag}
            </p>
          </div>
        )}
        {action &&
          (() => {
            const isLoading = activeActionKey === action.action.uiKey
            const isDisabled = activeActionKey !== null && !isLoading
            return (
              <button
                disabled={isDisabled || isLoading}
                onClick={(e) => {
                  e.preventDefault()
                  onAction(action.action)
                }}
                className={cn(
                  'shrink-0 rounded-xl px-5 py-2 text-sm font-semibold transition-colors',
                  isLoading
                    ? 'cursor-wait bg-gray-100 text-gray-400'
                    : isDisabled
                      ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                      : 'bg-primary/10 text-primary hover:bg-primary/20',
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    מבצע...
                  </span>
                ) : (
                  action.label
                )}
              </button>
            )
          })()}
      </div>
    </>
  )

  const baseClass =
    'flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md'

  if (!action) {
    return (
      <Link to={item.href} className={cn('group', baseClass)}>
        {cardContent}
      </Link>
    )
  }

  return <div className={baseClass}>{cardContent}</div>
}

interface AttentionBoardProps {
  sections: PanelSection[]
  emptyChecks?: AttentionEmptyCheck[]
  activeActionKey?: string | null
  onAction?: (action: ActionCommand) => void
}

export const AttentionBoard = ({
  sections,
  emptyChecks = [],
  activeActionKey = null,
  onAction = () => {},
}: AttentionBoardProps) => {
  const sectionEntries = useMemo(
    () =>
      sections.map((section, index) => ({
        section,
        stateKey: `${section.key}:${index}`,
      })),
    [sections],
  )
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0)

  const [activeTab, setActiveTab] = useState(() => sectionEntries[0]?.stateKey ?? '')
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})

  const activeEntry = sectionEntries.find((entry) => entry.stateKey === activeTab)

  useEffect(() => {
    if (sectionEntries.length === 0) {
      setActiveTab('')
      return
    }
    if (!sectionEntries.some((entry) => entry.stateKey === activeTab)) {
      setActiveTab(sectionEntries[0].stateKey)
    }
  }, [activeTab, sectionEntries])

  const toggleGroup = (section: PanelSection, stateKey: string) =>
    setVisibleCounts((prev) => {
      const current = prev[stateKey] ?? ATTENTION_BATCH_SIZE
      const nextCount = current >= section.items.length ? ATTENTION_BATCH_SIZE : current + ATTENTION_BATCH_SIZE

      return { ...prev, [stateKey]: nextCount }
    })

  return (
    <DashboardPanel>
      <div className="border-b border-gray-100 px-5 py-4">
        <DashboardSectionHeader
          icon={ShieldAlert}
          title="לוח תשומת לב"
          subtitle={totalItems === 0 ? 'הכל תקין — אין דברים ממתינים' : `${totalItems} פריטים ממתינים לטיפול`}
          count={totalItems}
          tone={totalItems > 0 ? 'amber' : 'neutral'}
        />
      </div>

      {sectionEntries.length === 0 ? (
        <div className="px-5 py-6">
          <DashboardEmptyState
            icon={CheckCircle2}
            title="כל הפריטים תחת שליטה"
            description="אין דחיפויות כרגע"
            className="py-5"
          />
          {emptyChecks.length > 0 && (
            <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
              {emptyChecks.map((check) => (
                <div
                  key={check.key}
                  className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {check.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 p-6 sm:grid-cols-3 md:grid-cols-5">
            {sectionEntries.map(({ section, stateKey }) => {
              const isActive = activeTab === stateKey
              const count = section.items.length
              return (
                <button
                  key={stateKey}
                  onClick={() => setActiveTab(stateKey)}
                  className={cn(
                    'rounded-xl border p-4 text-center transition-all',
                    isActive
                      ? 'border-primary/20 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200',
                  )}
                >
                  <p className={cn('mb-1 text-[10px]', isActive ? 'text-primary' : 'text-gray-500')}>{section.title}</p>
                  <p
                    className={cn(
                      'text-xl font-bold tabular-nums',
                      isActive ? 'text-primary' : count === 0 ? 'text-slate-400' : 'text-gray-800',
                    )}
                  >
                    {count}
                  </p>
                </button>
              )
            })}
          </div>

          {activeEntry &&
            (() => {
              const { section: activeSection, stateKey } = activeEntry
              const visibleCount = visibleCounts[stateKey] ?? ATTENTION_BATCH_SIZE
              const visibleItems = activeSection.items.slice(0, visibleCount)
              const remainingCount = activeSection.items.length - visibleItems.length
              const canCollapse = visibleItems.length > ATTENTION_BATCH_SIZE
              const hasMore = remainingCount > 0

              return (
                <>
                  <div className="space-y-4 p-6">
                    {visibleItems.length > 0 ? (
                      visibleItems.map((item) => (
                        <TaskCard
                          key={item.id}
                          item={item}
                          tone={activeSection.tone}
                          sectionIcon={activeSection.icon}
                          activeActionKey={activeActionKey}
                          onAction={onAction}
                        />
                      ))
                    ) : (
                      <DashboardEmptyState
                        icon={CheckCircle2}
                        title="אין פריטים בקטגוריה"
                        description="אין משימות פתוחות כרגע"
                        className="py-8"
                      />
                    )}
                  </div>

                  {(hasMore || canCollapse) && (
                    <div className="flex border-t border-gray-100">
                      {canCollapse && (
                        <button
                          onClick={() =>
                            setVisibleCounts((prev) => ({
                              ...prev,
                              [stateKey]: ATTENTION_BATCH_SIZE,
                            }))
                          }
                          className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-400 transition-colors hover:bg-slate-50 hover:text-gray-600',
                            hasMore && 'border-l border-gray-100',
                          )}
                        >
                          <ChevronUp className="h-3 w-3" />
                          הצג פחות
                        </button>
                      )}

                      {hasMore && (
                        <button
                          onClick={() => toggleGroup(activeSection, stateKey)}
                          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-400 transition-colors hover:bg-slate-50 hover:text-gray-600"
                        >
                          <ChevronDown className="h-3 w-3" />
                          {`הצג עוד ${Math.min(ATTENTION_BATCH_SIZE, remainingCount)}`}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
        </>
      )}
    </DashboardPanel>
  )
}

AttentionBoard.displayName = 'AttentionBoard'
