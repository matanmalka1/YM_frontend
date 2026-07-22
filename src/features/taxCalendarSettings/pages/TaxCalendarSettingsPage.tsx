import { Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { formatCount } from '@/utils/utils'
import { TaxCalendarSettingsStatsSection } from '../components/TaxCalendarSettingsStatsSection'
import { TaxCalendarEntriesTables, TaxCalendarRulesTable } from '../components/TaxCalendarSettingsTables'
import { useTaxCalendarSettingsPage } from '../hooks/useTaxCalendarSettingsPage'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'
import { TAX_CALENDAR_SETTINGS_ERROR_MESSAGES } from '../errorMessages'

export const TaxCalendarSettingsPage = () => {
  const page = useTaxCalendarSettingsPage()

  if (page.denied) {
    return (
      <PageContent>
        <PageHeader
          title={TAX_CALENDAR_SETTINGS_MESSAGES.labels.pageTitle}
          description={TAX_CALENDAR_SETTINGS_MESSAGES.labels.limitedAccessDescription}
        />
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_MESSAGES.labels.accessDenied} />
      </PageContent>
    )
  }

  return (
    <PageContent>
      <PageHeader
        title={TAX_CALENDAR_SETTINGS_MESSAGES.labels.pageTitle}
        description={TAX_CALENDAR_SETTINGS_MESSAGES.labels.description}
      />

      <ToolbarContainer>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto_auto]">
          <Select
            label={TAX_CALENDAR_SETTINGS_MESSAGES.labels.startYearField}
            value={page.filters.startYear}
            options={page.filters.yearOptions}
            onChange={(event) => page.filters.setStartYear(event.target.value)}
            error={page.filters.startYearError ?? undefined}
          />
          <Select
            label={TAX_CALENDAR_SETTINGS_MESSAGES.labels.endYearField}
            value={page.filters.endYear}
            options={page.filters.yearOptions}
            onChange={(event) => page.filters.setEndYear(event.target.value)}
            error={page.filters.endYearError ?? undefined}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={page.filters.reset}>
              {TAX_CALENDAR_SETTINGS_MESSAGES.labels.resetYears}
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              icon={<Play className="h-4 w-4" />}
              onClick={page.bootstrap.run}
              disabled={!page.filters.isLoadable}
              isLoading={page.bootstrap.isLoading}
              loadingLabel={TAX_CALENDAR_SETTINGS_MESSAGES.labels.initializing}
            >
              {TAX_CALENDAR_SETTINGS_MESSAGES.labels.initializeCalendar}
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {page.filters.hasInvalidRange ? (
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidRange} />
      ) : !page.filters.isLoadable ? (
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidRangeToLoad} />
      ) : null}
      {page.stats.error && !page.filters.hasInvalidRange ? <Alert variant="error" message={page.stats.error} /> : null}

      <TaxCalendarSettingsStatsSection
        yearRange={page.stats.yearRange}
        totalEntries={page.stats.totalEntries}
        warningsCount={page.stats.warnings.length}
        isLoading={page.stats.isLoading}
      />

      {page.stats.warnings.map((warning) => (
        <Alert key={warning} variant="warning" message={warning} className="border-warning-300 bg-warning-50" />
      ))}

      {page.bootstrap.result ? (
        <div className="space-y-2">
          <Alert
            variant={page.bootstrap.warnings.length > 0 ? 'warning' : 'success'}
            message={TAX_CALENDAR_SETTINGS_MESSAGES.bootstrap.complete(
              formatCount(page.bootstrap.result.entries_created),
              formatCount(page.bootstrap.result.entries_skipped),
              formatCount(page.bootstrap.result.total_entries_for_range),
            )}
          />
          {page.bootstrap.warnings.map((warning) => (
            <Alert key={warning} variant="warning" message={warning} />
          ))}
        </div>
      ) : null}

      <TaxCalendarRulesTable {...page.rules} rules={page.rules.data} />
      <TaxCalendarEntriesTables {...page.entries} />
    </PageContent>
  )
}

TaxCalendarSettingsPage.displayName = 'TaxCalendarSettingsPage'
