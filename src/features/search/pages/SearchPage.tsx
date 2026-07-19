import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { useSearchPage } from '../hooks/useSearchPage'
import { SearchToolbar } from '../components/SearchToolbar'
import { SearchResultsSection } from '../components/SearchResultsSection'

export const Search: React.FC = () => {
  const { status, headerProps, toolbar, results } = useSearchPage()

  return (
    <PageContent>
      <PageHeader {...headerProps} />
      <SearchToolbar {...toolbar} />
      <SearchResultsSection status={status} {...results} />
    </PageContent>
  )
}
