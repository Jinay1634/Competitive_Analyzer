import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AnalysisPage from './features/analysis/AnalysisPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalysisPage />
    </QueryClientProvider>
  )
}
