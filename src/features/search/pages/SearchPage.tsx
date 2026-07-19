import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { useSearchPage } from '../hooks/useSearchPage'
import { SearchToolbar } from '../components/SearchToolbar'
import { SearchResultsSection } from '../components/SearchResultsSection'
import { SearchClientSummary } from '../components/SearchClientSummary'

export const Search: React.FC = () => {
  const { status, headerProps, clientSummary, toolbar, results } = useSearchPage()

  return (
    <PageContent>
      <PageHeader {...headerProps} />
      <SearchToolbar {...toolbar} />
      <SearchClientSummary {...clientSummary} />
      <SearchResultsSection status={status} {...results} />
    </PageContent>
  )
}
